import { useState } from "react";

import { OrderManualMessageField } from "@/features/order/manualMessage";

import {
  OrderFormAddressField,
  OrderFormCustomerNoteField,
  OrderFormEmailField,
  OrderFormExternalSourceField,
  OrderFormExternalTrackingLinkField,
  OrderFormExternalTrackingNumberField,
  OrderFormFirstNameField,
  OrderFormGeneralNoteField,
  OrderFormHelpToCarryField,
  OrderFormLastNameField,
  OrderFormMarketingMessagesField,
  OrderFormPlanObjectiveField,
  OrderFormPrimaryPhoneField,
  OrderFormReferenceField,
  OrderFormSecondaryPhoneField,
} from "../../components/fields/OrderFormFieldControls";
import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";
import { OrderFormMobileRow, OrderFormMobileSection } from "./OrderFormMobileSection";

type OrderFormFieldsMobileProps = {
  model: OrderFormLayoutModel;
};

/** Single-column field sections for the phone; one field per row. */
export const OrderFormFieldsMobile = ({ model }: OrderFormFieldsMobileProps) => {
  const { formState, orderServerId } = model;
  const [showMore, setShowMore] = useState(false);

  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => event.preventDefault()}>
      <OrderFormMobileSection title="Contact">
        <OrderFormMobileRow>
          <OrderFormEmailField model={model} />
        </OrderFormMobileRow>
        <OrderFormMobileRow>
          <OrderFormPrimaryPhoneField model={model} />
        </OrderFormMobileRow>
        <OrderFormMobileRow>
          <OrderFormSecondaryPhoneField model={model} />
        </OrderFormMobileRow>
        <OrderFormMobileRow>
          <OrderFormFirstNameField model={model} />
        </OrderFormMobileRow>
        <OrderFormMobileRow>
          <OrderFormLastNameField model={model} />
        </OrderFormMobileRow>
      </OrderFormMobileSection>

      <OrderFormMobileSection title="Address">
        <div className="cell-default">
          <OrderFormAddressField model={model} />
        </div>
      </OrderFormMobileSection>

      <OrderFormMobileSection title="Delivery">
        <OrderFormMobileRow>
          <OrderFormGeneralNoteField model={model} />
        </OrderFormMobileRow>
        <OrderFormMobileRow>
          <OrderFormHelpToCarryField model={model} />
        </OrderFormMobileRow>
      </OrderFormMobileSection>

      <OrderFormMobileSection
        title="More details"
        action={
          <button
            type="button"
            onClick={() => setShowMore((previous) => !previous)}
            aria-expanded={showMore}
            className="touch-hit-area cursor-pointer text-xs font-semibold text-[var(--color-primary)]"
          >
            {showMore ? "Hide" : "Show"}
          </button>
        }
      >
        {showMore ? (
          <>
            <OrderFormMobileRow>
              <OrderFormCustomerNoteField model={model} />
            </OrderFormMobileRow>
            <OrderFormMobileRow>
              <OrderFormMarketingMessagesField model={model} />
            </OrderFormMobileRow>
            <OrderFormMobileRow>
              <OrderFormReferenceField model={model} />
            </OrderFormMobileRow>
            <OrderFormMobileRow>
              <OrderFormExternalSourceField model={model} />
            </OrderFormMobileRow>
            <OrderFormMobileRow>
              <OrderFormExternalTrackingNumberField model={model} />
            </OrderFormMobileRow>
            <OrderFormMobileRow>
              <OrderFormExternalTrackingLinkField model={model} />
            </OrderFormMobileRow>
            {formState.delivery_plan_id == null ? (
              <OrderFormMobileRow>
                <OrderFormPlanObjectiveField model={model} />
              </OrderFormMobileRow>
            ) : null}
          </>
        ) : (
          <p className="px-4 py-3 text-sm text-[var(--color-muted)]">
            Reference, external source, tracking and plan objective.
          </p>
        )}
      </OrderFormMobileSection>

      {/* Manual messaging targets an existing order, so it stays hidden until the order has a server id. */}
      {orderServerId !== null ? (
        <OrderManualMessageField orderId={orderServerId} />
      ) : null}
    </form>
  );
};
