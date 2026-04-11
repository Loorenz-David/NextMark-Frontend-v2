import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCreateRouteGroupController } from "@/features/plan/routeGroup/controllers/useCreateRouteGroup.controller";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import {
  selectWorkingZoneVersionId,
  selectZonesByVersion,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import { CreateRouteGroupFormContextProvider } from "./CreateRouteGroupForm.context";
import { createRouteGroupFormSetters } from "./createRouteGroupForm.setters";
import {
  hasCreateRouteGroupFormErrors,
  validateCreateRouteGroupForm,
} from "./CreateRouteGroupForm.validation";
import type {
  CreateRouteGroupFormPopupPayload,
  CreateRouteGroupFormState,
  CreateRouteGroupZoneOption,
} from "./CreateRouteGroupForm.types";

type Props = {
  payload?: CreateRouteGroupFormPopupPayload;
  children: ReactNode;
  onSuccessClose?: () => void | Promise<void>;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
};

const initialState = (): CreateRouteGroupFormState => ({
  name: "",
  zone_id: null,
});

export const CreateRouteGroupFormProvider = ({
  payload,
  children,
  onSuccessClose,
  onUnsavedChangesChange,
}: Props) => {
  const planId = payload?.planId ?? null;
  const [formState, setFormState] = useState<CreateRouteGroupFormState>(
    initialState(),
  );
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const formSetters = useMemo(
    () => createRouteGroupFormSetters({ setFormState }),
    [],
  );

  const routeGroups = useRouteGroupsByPlanId(planId);
  const workingVersionId = useZoneStore(selectWorkingZoneVersionId);
  const availableZones = useZoneStore(
    useShallow((state) => selectZonesByVersion(state, workingVersionId)),
  );
  const { isSubmitting, createRouteGroup } = useCreateRouteGroupController(
    planId ?? 0,
    onSuccessClose,
  );

  const zoneOptions = useMemo<CreateRouteGroupZoneOption[]>(() => {
    const usedZoneMap = routeGroups.reduce<Map<number, string>>((acc, routeGroup) => {
      if (typeof routeGroup.zone_id === "number") {
        acc.set(
          routeGroup.zone_id,
          routeGroup.zone_snapshot?.name?.trim() ||
            `Route group ${routeGroup.zone_id}`,
        );
      }
      return acc;
    }, new Map());

    return availableZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      disabled:
        usedZoneMap.has(zone.id) && formState.zone_id !== zone.id,
      assignedGroupName: usedZoneMap.get(zone.id) ?? null,
    }));
  }, [availableZones, formState.zone_id, routeGroups]);

  const formErrors = useMemo(
    () => validateCreateRouteGroupForm(formState),
    [formState],
  );

  const hasUnsavedChanges = useMemo(
    () => Boolean(formState.name.trim()) || formState.zone_id !== null,
    [formState.name, formState.zone_id],
  );

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  const actions = useMemo(
    () => ({
      handleSubmit: async () => {
        setShouldShowErrors(true);
        if (planId == null) {
          return false;
        }
        if (hasCreateRouteGroupFormErrors(formErrors)) {
          return false;
        }
        return createRouteGroup(formState);
      },
    }),
    [createRouteGroup, formErrors, formState, planId],
  );

  const value = useMemo(
    () => ({
      planId: planId ?? 0,
      formState,
      formErrors,
      shouldShowErrors,
      hasUnsavedChanges,
      availableZones: zoneOptions,
      isSubmitting,
      formSetters,
      actions,
    }),
    [
      actions,
      formErrors,
      formSetters,
      formState,
      shouldShowErrors,
      hasUnsavedChanges,
      isSubmitting,
      planId,
      zoneOptions,
    ],
  );

  return (
    <CreateRouteGroupFormContextProvider value={value}>
      {children}
    </CreateRouteGroupFormContextProvider>
  );
};
