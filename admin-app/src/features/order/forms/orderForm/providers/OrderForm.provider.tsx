import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMobile } from "@/app/contexts/MobileContext";
import { useCostumerByServerId, type Costumer } from "@/features/costumer";
import { useCostumerQueries } from "@/features/costumer/controllers/costumerQueries.controller";
import { hasFormChanges } from "@shared-domain";
import { formatIsoDate } from "@/shared/utils/formatIsoDate";

import { useOrderItemDraftController } from "../../../item";
import { useOrderByClientId } from "../../../store/orderHooks.store";
import { useOrderFormActions } from "../controllers/useOrderFormSubmit.actions";
import { OrderFormContextComposer } from "../context/OrderForm.context";
import { applySelectedCostumerToOrderForm } from "../flows/orderFormCostumerApply.flow";
import {
  normalizeEmail,
  useOrderFormCostumerLookupFlow,
} from "../flows/orderFormCostumerLookup.flow";
import { useOrderFormItemsFlow } from "../flows/orderFormItems.flow";
import { useOrderFormItemEditorActions } from "../actions/orderFormItemEditor.actions";
import { useOrderFormCloseController } from "./useOrderFormCloseController";
import { useOrderFormBootstrapState } from "./useOrderFormBootstrapState";
import type {
  CostumerSelectionRequestResult,
  CostumerSelectionSource,
  OrderFormMode,
  OrderFormState,
  OrderFormPayload,
} from "../state/OrderForm.types";
import { useOrderFormValidation } from "../state/OrderForm.validation";
import { useOrderFormWarnings } from "../state/OrderForm.warnings";
import { useOrderFormSetters } from "../state/orderForm.setters";
import { useCostumerFromOrderFlow } from "../flows/orderFormCostumerLoad.flow";

type PendingCostumerAction = "replace" | "keep" | "cancel";

export const shouldPromptCostumerSelection = ({
  mode,
  source,
}: {
  mode: OrderFormMode;
  source: CostumerSelectionSource;
}) => mode === "edit" && source !== "lookup";

export const resolvePendingCostumerAction = ({
  action,
  pendingCostumer,
  pendingCostumerSource,
  currentSelectedCostumer,
  currentSelectedCostumerSource,
}: {
  action: PendingCostumerAction;
  pendingCostumer: Costumer | null;
  pendingCostumerSource: CostumerSelectionSource | null;
  currentSelectedCostumer: Costumer | null;
  currentSelectedCostumerSource: CostumerSelectionSource | null;
}) => {
  if (!pendingCostumer || action === "cancel") {
    return {
      selectedCostumer: currentSelectedCostumer,
      selectedCostumerSource: currentSelectedCostumerSource,
      shouldApplySnapshot: false,
    };
  }

  return {
    selectedCostumer: pendingCostumer,
    selectedCostumerSource: pendingCostumerSource ?? "panel",
    shouldApplySnapshot: action === "replace",
  };
};

const applyCostumerSnapshotToOrderForm = ({
  costumer,
  setFormState,
}: {
  costumer: Costumer;
  setFormState: Dispatch<SetStateAction<OrderFormState>>;
}) => {
  setFormState((previousState) =>
    applySelectedCostumerToOrderForm({
      selectedCostumer: costumer,
      previousState,
    }),
  );
};

export const OrderFormProvider = ({
  payload,
  onClose,
  children,
}: {
  payload?: OrderFormPayload;
  onClose?: () => void;
  children: ReactNode;
}) => {
  const { isMobile } = useMobile();
  const [mode, setMode] = useState<OrderFormMode>(payload?.mode ?? "create");
  const [activeClientId, setActiveClientId] = useState<string | null>(
    payload?.clientId ?? null,
  );
  const payloadCostumerId = payload?.costumer_id ?? null;
  const order = useOrderByClientId(activeClientId);
  const orderServerId = order?.id ?? null;
  const creationDate = formatIsoDate(order?.creation_date) ?? "";

  const [selectedCostumer, setSelectedCostumer] = useState<Costumer | null>(
    null,
  );
  const [selectedCostumerSource, setSelectedCostumerSource] =
    useState<CostumerSelectionSource | null>(null);
  const [pendingCostumerChange, setPendingCostumerChange] =
    useState<Costumer | null>(null);
  const [pendingCostumerChangeSource, setPendingCostumerChangeSource] =
    useState<CostumerSelectionSource | null>(null);
  const [isCostumerChangePromptOpen, setIsCostumerChangePromptOpen] =
    useState(false);
  const payloadCostumer = useCostumerByServerId(payloadCostumerId);
  const { queryCostumerByServerId } = useCostumerQueries();
  const appliedPayloadCostumerIdRef = useRef<number | null>(null);

  // this flow might not be the appropiate implementation we must check deep if it is not correct.
  useCostumerFromOrderFlow({ order, setSelectedCostumer });

  const { formState, setFormState, initialFormRef } =
    useOrderFormBootstrapState({
      mode,
      order,
      payloadClientId: activeClientId,
      payloadDeliveryPlanId: payload?.deliveryPlanId ?? null,
      payloadRouteGroupId: payload?.routeGroupId ?? null,
      payloadRestoreFormState: payload?.restoreFormState ?? null,
    });

  const applySelectedCostumerNow = useCallback(
    (costumer: Costumer) => {
      applyCostumerSnapshotToOrderForm({ costumer, setFormState });
    },
    [setFormState],
  );

  const resetPendingCostumerChange = useCallback(() => {
    setPendingCostumerChange(null);
    setPendingCostumerChangeSource(null);
    setIsCostumerChangePromptOpen(false);
  }, []);

  const requestSelectCostumer = useCallback(
    (
      value: Costumer,
      source: CostumerSelectionSource,
    ): CostumerSelectionRequestResult => {
      if (!value?.client_id) {
        return "ignored";
      }

      if (selectedCostumer?.client_id === value.client_id) {
        // Embedded edit can save the same costumer id with updated fields.
        // Refresh selected costumer so UI reflects latest values and allow panel close flow.
        if (source === "embedded") {
          setSelectedCostumer(value);
          setSelectedCostumerSource(source);
          if (mode === "create") {
            applySelectedCostumerNow(value);
          }
          return "applied";
        }
        return "ignored";
      }

      if (shouldPromptCostumerSelection({ mode, source })) {
        setPendingCostumerChange(value);
        setPendingCostumerChangeSource(source);
        setIsCostumerChangePromptOpen(true);
        return "prompted";
      }

      setSelectedCostumer(value);
      setSelectedCostumerSource(source);
      applySelectedCostumerNow(value);
      return "applied";
    },
    [applySelectedCostumerNow, mode, selectedCostumer?.client_id],
  );

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    if (typeof payloadCostumerId !== "number") {
      return;
    }

    if (appliedPayloadCostumerIdRef.current === payloadCostumerId) {
      return;
    }

    let cancelled = false;

    const applyPayloadCostumer = async () => {
      const resolvedCostumer =
        payloadCostumer ?? (await queryCostumerByServerId(payloadCostumerId));
      if (cancelled || !resolvedCostumer) return;
      requestSelectCostumer(resolvedCostumer, "panel");
      appliedPayloadCostumerIdRef.current = payloadCostumerId;
    };

    void applyPayloadCostumer();

    return () => {
      cancelled = true;
    };
  }, [
    mode,
    payloadCostumerId,
    payloadCostumer,
    queryCostumerByServerId,
    requestSelectCostumer,
  ]);

  const confirmReplaceWithPendingCostumer = useCallback(() => {
    const nextSelection = resolvePendingCostumerAction({
      action: "replace",
      pendingCostumer: pendingCostumerChange,
      pendingCostumerSource: pendingCostumerChangeSource,
      currentSelectedCostumer: selectedCostumer,
      currentSelectedCostumerSource: selectedCostumerSource,
    });

    setSelectedCostumer(nextSelection.selectedCostumer);
    setSelectedCostumerSource(nextSelection.selectedCostumerSource);
    if (nextSelection.shouldApplySnapshot && nextSelection.selectedCostumer) {
      applySelectedCostumerNow(nextSelection.selectedCostumer);
    }
    resetPendingCostumerChange();
  }, [
    applySelectedCostumerNow,
    pendingCostumerChange,
    pendingCostumerChangeSource,
    resetPendingCostumerChange,
    selectedCostumer,
    selectedCostumerSource,
  ]);

  const confirmKeepSnapshotWithPendingCostumer = useCallback(() => {
    const nextSelection = resolvePendingCostumerAction({
      action: "keep",
      pendingCostumer: pendingCostumerChange,
      pendingCostumerSource: pendingCostumerChangeSource,
      currentSelectedCostumer: selectedCostumer,
      currentSelectedCostumerSource: selectedCostumerSource,
    });
    setSelectedCostumer(nextSelection.selectedCostumer);
    setSelectedCostumerSource(nextSelection.selectedCostumerSource);
    resetPendingCostumerChange();
  }, [
    pendingCostumerChange,
    pendingCostumerChangeSource,
    resetPendingCostumerChange,
    selectedCostumer,
    selectedCostumerSource,
  ]);

  const cancelPendingCostumerChange = useCallback(() => {
    resetPendingCostumerChange();
  }, [resetPendingCostumerChange]);

  const isLookupEnabled =
    mode === "create" &&
    selectedCostumerSource !== "panel" &&
    selectedCostumerSource !== "embedded";

  useOrderFormCostumerLookupFlow({
    mode,
    enabled: isLookupEnabled,
    email: formState.client_email,
    selectedCostumerEmail: selectedCostumer?.email,
    onResolved: (costumer) => {
      requestSelectCostumer(costumer, "lookup");
    },
  });

  // If email changes away from a lookup-selected costumer, clear that lookup selection.
  useEffect(() => {
    if (selectedCostumerSource !== "lookup" || !selectedCostumer) {
      return;
    }

    const normalizedInputEmail = normalizeEmail(formState.client_email);
    const normalizedSelectedEmail = normalizeEmail(
      selectedCostumer.email ?? null,
    );
    if (normalizedInputEmail === normalizedSelectedEmail) {
      return;
    }

    setSelectedCostumer(null);
    setSelectedCostumerSource(null);
  }, [formState.client_email, selectedCostumer, selectedCostumerSource]);

  const warnings = useOrderFormWarnings();
  const formSetters = useOrderFormSetters({
    setFormState,
    warnings,
  });
  const { validateForm } = useOrderFormValidation({ formState, warnings });

  const { initialItems, isLoadingInitialItems, itemInitialByClientId } =
    useOrderFormItemsFlow({
      mode,
      orderServerId,
    });

  const itemDraftController = useOrderItemDraftController({
    mode,
    initialItems,
  });

  const {
    visibleItems: visibleItemDrafts,
    createItem,
    updateItem,
    deleteItem,
    getCreatedItems,
    getUpdatedItems,
    getDeletedItems,
    reset: resetItemDrafts,
  } = itemDraftController;

  const draftOrderIdRef = useRef<number>(Date.now());
  const effectiveDraftOrderId = orderServerId ?? draftOrderIdRef.current;

  const itemEditor = useOrderFormItemEditorActions({
    itemDraftController: {
      createItem,
      updateItem,
      deleteItem,
    },
    effectiveDraftOrderId,
  });

  const actions = useOrderFormActions({
    mode,
    order,
    orderServerId,
    formState,
    validateForm,
    initialFormRef,
    itemDraftController: {
      getCreatedItems,
      getUpdatedItems,
      getDeletedItems,
      reset: resetItemDrafts,
    },
    itemInitialByClientId,
    selectedCostumer,
    onPromoteCreatedOrderToEdit: (clientId) => {
      setActiveClientId(clientId);
      setMode("edit");
    },
  });

  const hasUnsavedChanges = useMemo(
    () => hasFormChanges(formState, initialFormRef),
    [formState, initialFormRef],
  );

  const closeController = useOrderFormCloseController({
    isMobile,
    hasUnsavedChanges,
    onClose,
  });

  const formSlice = useMemo(
    () => ({
      formState,
      warnings,
      formSetters,
    }),
    [formSetters, formState, warnings],
  );

  const actionsSlice = useMemo(
    () => ({
      actions,
    }),
    [actions],
  );

  const itemEditorSlice = useMemo(
    () => ({
      itemEditor,
    }),
    [itemEditor],
  );

  const metaSlice = useMemo(
    () => ({
      requestSelectCostumer,
      confirmReplaceWithPendingCostumer,
      confirmKeepSnapshotWithPendingCostumer,
      cancelPendingCostumerChange,
      meta: {
        mode,
        order,
        selectedCostumer,
        selectedCostumerSource,
        pendingCostumerChange,
        isCostumerChangePromptOpen,
        creationDate,
        initialFormRef,
        visibleItemDrafts,
        itemInitialByClientId,
        isLoadingInitialItems,
      },
    }),
    [
      cancelPendingCostumerChange,
      confirmKeepSnapshotWithPendingCostumer,
      confirmReplaceWithPendingCostumer,
      creationDate,
      initialFormRef,
      isCostumerChangePromptOpen,
      isLoadingInitialItems,
      itemInitialByClientId,
      mode,
      order,
      pendingCostumerChange,
      requestSelectCostumer,
      selectedCostumer,
      selectedCostumerSource,
      visibleItemDrafts,
    ],
  );

  const closeSlice = useMemo(
    () => ({
      closeController,
    }),
    [closeController],
  );

  return (
    <OrderFormContextComposer
      formSlice={formSlice}
      actionsSlice={actionsSlice}
      itemEditorSlice={itemEditorSlice}
      metaSlice={metaSlice}
      closeSlice={closeSlice}
    >
      {children}
    </OrderFormContextComposer>
  );
};
