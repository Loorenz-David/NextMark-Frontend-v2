import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";

import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";
import type { OrderFormExternalFlow } from "../../flows/orderFormExternalRealtime.flow";
import type { useOrderFormSendController } from "../../controllers/useOrderFormSend.controller";
import { OrderFormCostumerSectionMobile } from "./OrderFormCostumerSectionMobile";
import { OrderFormFieldsMobile } from "./OrderFormFieldsMobile";
import { OrderFormFooterMobile } from "./OrderFormFooterMobile";
import { OrderFormHeaderMobile } from "./OrderFormHeaderMobile";
import { OrderFormItemsSectionMobile } from "./OrderFormItemsSectionMobile";

/**
 * Phone order form: fixed header and action bar, one scrolling column of
 * sections between them. Sub-flows (item editor, customer form) push their
 * own pages on top instead of sharing this scroll area.
 */
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--color-ligth-bg)]">
      <OrderFormHeaderMobile
        label={model.label}
        operationType={model.formState.operation_type}
        orderScalarId={model.order?.order_scalar_id ?? null}
        referenceNumber={model.order?.reference_number ?? null}
        externalSource={model.order?.external_source ?? null}
        onSelectOperationType={model.formSetters.handleOperationType}
        onClose={model.closeController.requestClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="flex flex-col gap-5 px-3 pb-8 pt-4">
          <OrderFormCostumerSectionMobile model={model} />
          <OrderFormFieldsMobile model={model} />
          <OrderFormItemsSectionMobile model={model} />

          {model.mode === "edit" ? (
            <ConfirmActionButton
              onConfirm={() => {
                void model.handleDelete();
              }}
              deleteContent="Delete order"
              confirmContent="Tap again to delete"
              deleteClassName="flex h-12 w-full items-center justify-center rounded-2xl border border-danger-border bg-danger-bg text-[15px] font-medium text-danger"
              confirmClassName="flex h-12 w-full items-center justify-center rounded-2xl bg-danger-solid text-[15px] font-medium text-danger-on-solid"
            />
          ) : null}
        </div>
      </div>

      <OrderFormFooterMobile
        onSendToLinkedDevice={sendController.handleSendToLinkedDevice}
        onSendToCustomer={sendController.handleSendToCustomer}
        onRequestClearSendStatus={sendController.clearSendStatus}
        onSaveOrder={model.handleSave}
        sendDisabled={externalFlow.employeeUserId <= 0}
        sendStatus={sendController.sendStatus}
        sendInProgress={sendController.sendStatusMeta.isSending}
      />
    </div>
  );
};
