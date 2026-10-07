import { useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { Cell, SplitRow } from "@/shared/layout/cells";

import { OrderManualMessageField } from "@/features/order/manualMessage";

import type { OrderFormLayoutModel } from "../OrderForm.layout.model";
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
} from "./fields/OrderFormFieldControls";

type OrderFormFieldsProps = {
  model: OrderFormLayoutModel;
  compact?: boolean;
};

const TWO_COLUMN_ROW_CLASS =
  "grid grid-cols-2 divide-x divide-[var(--color-border-accent)]";

/** Desktop field grid. The phone layout renders `OrderFormFieldsMobile`. */
export const OrderFormFields = ({
  model,
  compact = false,
}: OrderFormFieldsProps) => {
  const { formState, orderServerId } = model;

  const [showMore, setShowMore] = useState(false);

  return (
    <form
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 scroll-thin bg-[var(--color-ligth-bg)] ${
        compact ? "pb-5" : "h-full pb-[100px]"
      }`}
    >
      <div className=" rounded-2xl border border-[var(--color-border-accent)] bg-[var(--surface-popup-chrome)] shadow-sm">
        <Cell>
          <OrderFormEmailField model={model} />
        </Cell>

        <SplitRow splitRowClass={TWO_COLUMN_ROW_CLASS}>
          <Cell>
            <OrderFormPrimaryPhoneField model={model} />
          </Cell>
          <Cell>
            <OrderFormSecondaryPhoneField model={model} />
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass={TWO_COLUMN_ROW_CLASS}>
          <Cell>
            <OrderFormFirstNameField model={model} />
          </Cell>
          <Cell>
            <OrderFormLastNameField model={model} />
          </Cell>
        </SplitRow>

        <div
          className={`border-t border-[var(--color-border-accent)] cell-default`}
        >
          <OrderFormAddressField model={model} />
        </div>

        <SplitRow splitRowClass={TWO_COLUMN_ROW_CLASS}>
          <Cell>
            <OrderFormGeneralNoteField model={model} />
          </Cell>
          <Cell>
            <OrderFormHelpToCarryField model={model} />
          </Cell>
        </SplitRow>
        {showMore ? (
          <>
            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <OrderFormCustomerNoteField model={model} />
            </div>
            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <OrderFormMarketingMessagesField model={model} />
            </div>

            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <OrderFormReferenceField model={model} />
            </div>

            <div
              className={`border-t border-[var(--color-border-accent)] px-3 py-2`}
            >
              <OrderFormExternalSourceField model={model} />
            </div>

            <SplitRow splitRowClass={TWO_COLUMN_ROW_CLASS}>
              <Cell>
                <OrderFormExternalTrackingNumberField model={model} />
              </Cell>
              <Cell>
                <OrderFormExternalTrackingLinkField model={model} />
              </Cell>
            </SplitRow>

            {formState.delivery_plan_id == null ? (
              <div
                className={`border-t border-[var(--color-border-accent)] px-3 py-2`}
              >
                <OrderFormPlanObjectiveField model={model} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex justify-end py-2 pr-3">
        <BasicButton
          params={{
            variant: "text",
            onClick: () => setShowMore((prev) => !prev),
            className: "px-0 py-0 text-[10px] text-[var(--color-muted)]",
            ariaLabel: showMore ? "Show less fields" : "Show more fields",
          }}
        >
          {showMore ? "less" : "more"}
        </BasicButton>
      </div>

      {/* Manual messaging targets an existing order, so it stays hidden until the order has a server id. */}
      {orderServerId !== null ? (
        <OrderManualMessageField orderId={orderServerId} className="mb-2" />
      ) : null}
    </form>
  );
};
