import { OrderFormFooter } from "../../components/OrderFormFooter";
import { OrderFormFields } from "../../components/OrderFormFields";
import { OrderFormHeader } from "../../components/OrderFormHeader";
import { OrderFormItemsPanel } from "../../components/OrderFormItemsPanel";
import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";
import type { OrderFormExternalFlow } from "../../flows/orderFormExternalRealtime.flow";
import type { useOrderFormSendController } from "../../controllers/useOrderFormSend.controller";

export const OrderFormMobileLayout = ({
  model,
  externalFlow,
  sendController,
}: {
  model: OrderFormLayoutModel;
  externalFlow: OrderFormExternalFlow;
  sendController: ReturnType<typeof useOrderFormSendController>;
}) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto scroll-thin overflow-x-hidden pb-28">
      <div className="relative flex w-full min-h-0 flex-col bg-[var(--color-page)]">
        <OrderFormHeader
          label={model.label}
          operationType={model.formState.operation_type}
          orderScalarId={model.order?.order_scalar_id ?? null}
          isMobile={true}
          onSelectOperationType={model.formSetters.handleOperationType}
          onClose={model.closeController.requestClose}
        />

        <OrderFormFields model={model} compact={true} />
      </div>

      <OrderFormItemsPanel model={model} compact={true} />

      {!model.isItemEditorOpen ? (
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
          isMobile={true}
        />
      ) : null}
    </div>
  );
};
