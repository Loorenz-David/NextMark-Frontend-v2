import { motion } from "framer-motion";
import { OrderFormFooter } from "../../components/OrderFormFooter";
import { OrderFormFields } from "../../components/OrderFormFields";
import { OrderFormHeader } from "../../components/OrderFormHeader";
import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";
import type { OrderFormExternalFlow } from "../../flows/orderFormExternalRealtime.flow";
import type { useOrderFormSendController } from "../../controllers/useOrderFormSend.controller";
import { OrderFormDesktopRightColumn } from "./OrderFormDesktopRightColumn";
import { useState } from "react";

export type DesktopLayoutMode = "default" | "customer-expanded";

export const OrderFormDesktopLayout = ({
  model,
  externalFlow,
  sendController,
}: {
  model: OrderFormLayoutModel;
  externalFlow: OrderFormExternalFlow;
  sendController: ReturnType<typeof useOrderFormSendController>;
}) => {
  const [layoutMode, setLayoutMode] = useState<DesktopLayoutMode>("default");

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 gap-6 max-w-[950px] overflow-hidden">
      <motion.div
        className="relative flex h-full w-[560px] min-w-0 shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-page)]"
        layout
        animate={{
          opacity: layoutMode === "customer-expanded" ? 0 : 1,
          x: layoutMode === "customer-expanded" ? -400 : 0,
          width: layoutMode === "customer-expanded" ? 60 : 560,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <OrderFormHeader
          label={model.label}
          operationType={model.formState.operation_type}
          orderScalarId={model.order?.order_scalar_id ?? null}
          isMobile={false}
          onSelectOperationType={model.formSetters.handleOperationType}
          onClose={model.closeController.requestClose}
        />

        <OrderFormFields model={model} />

        <OrderFormFooter
          onSendToLinkedDevice={sendController.handleSendToLinkedDevice}
          onSendToCustomer={sendController.handleSendToCustomer}
          onRequestClearSendStatus={sendController.clearSendStatus}
          onSaveOrder={model.handleSave}
          onDeleteOrder={
            model.mode === "edit"
              ? () => {
                  void model.handleDelete();
                }
              : undefined
          }
          sendDisabled={externalFlow.employeeUserId <= 0}
          sendStatus={sendController.sendStatus}
          sendInProgress={sendController.sendStatusMeta.isSending}
        />
      </motion.div>
      <OrderFormDesktopRightColumn
        model={model}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
      />
    </div>
  );
};
