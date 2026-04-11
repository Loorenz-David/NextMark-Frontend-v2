import type { StackComponentProps } from "@/shared/stack-manager/types";
import { AnimatePresence } from "framer-motion";

import { OrderFormFeature } from "@/features/order/forms/orderForm/OrderForm";
import { OrderFormDesktopLayout } from "@/features/order/forms/orderForm/views/desktop/OrderFormDesktop.layout";
import { OrderFormCostumerChangePrompt } from "@/features/order/forms/orderForm/components/CostumerChangePrompt";
import {
  useOrderFormLayoutModel,
  type OrderFormLayoutModel,
} from "@/features/order/forms/orderForm/OrderForm.layout.model";
import { OrderFormMobileLayout } from "@/features/order/forms/orderForm/views/mobile/OrderFormMobile.layout";
import type { OrderFormPayload } from "@/features/order/forms/orderForm/state/OrderForm.types";
import {
  useOrderFormExternalFlow,
  type OrderFormExternalFlow,
} from "@/features/order/forms/orderForm/flows/orderFormExternalRealtime.flow";
import { useOrderFormSendController } from "@/features/order/forms/orderForm/controllers/useOrderFormSend.controller";
import { ConfirmActionPopup } from "@/shared/popups/ConfirmActionPopup";

import { OrderFormShell } from "./OrderFormShell";

type OrderFormPopupViewProps = {
  model: OrderFormLayoutModel;
  externalFlow: OrderFormExternalFlow;
  sendController: ReturnType<typeof useOrderFormSendController>;
};

const OrderFormPopupBody = () => {
  const model = useOrderFormLayoutModel();
  const externalFlow = useOrderFormExternalFlow();
  const sendController = useOrderFormSendController({ model, externalFlow });
  const pendingCostumerName =
    `${model.pendingCostumerChange?.first_name ?? ""} ${model.pendingCostumerChange?.last_name ?? ""}`.trim();

  return (
    <>
      <OrderFormShell<OrderFormPopupViewProps>
        onRequestClose={model.closeController.requestClose}
        desktopView={OrderFormDesktopLayout}
        mobileView={OrderFormMobileLayout}
        viewProps={{ model, externalFlow, sendController }}
      />
      <AnimatePresence>
        {model.isCostumerChangePromptOpen ? (
          <div className="fixed inset-0 z-[125]">
            <OrderFormCostumerChangePrompt
              pendingCostumerName={pendingCostumerName}
              onReplace={model.confirmReplaceWithPendingCostumer}
              onKeep={model.confirmKeepSnapshotWithPendingCostumer}
              onCancel={model.cancelPendingCostumerChange}
            />
          </div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {model.closeController.closeState === "confirming" ? (
          <div className="fixed inset-0 z-[120]">
            <ConfirmActionPopup
              onConfirm={model.closeController.confirmClose}
              onCancel={model.closeController.cancelClose}
              message="You have unsaved changes. Close without saving?"
            />
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export const OrderForm = ({
  payload,
  onClose,
}: StackComponentProps<OrderFormPayload>) => (
  <OrderFormFeature payload={payload} onClose={onClose}>
    <OrderFormPopupBody />
  </OrderFormFeature>
);
