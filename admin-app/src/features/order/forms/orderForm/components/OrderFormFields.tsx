import { useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { OptionPopoverSelect } from "@/shared/inputs/OptionPopoverSelect";
import { PhoneField } from "@/shared/inputs/PhoneField";
import { AddressAutocomplete } from "@/shared/inputs/address-autocomplete/AddressAutocomplete";

import {
  ORDER_PLAN_OBJECTIVE_OPTIONS,
  type OrderFormLayoutModel,
} from "../OrderForm.layout.model";
import { OrderFormDeliveryWindowCalendar } from "./DeliveryWindowCalendar";
import { Cell, SplitRow } from "@/shared/layout/cells";
import { ORDER_PLAN_OBJECTIVE_INFO } from "../info/orderPlanObjective.info";

type OrderFormFieldsProps = {
  model: OrderFormLayoutModel;
  compact?: boolean;
};

export const OrderFormFields = ({
  model,
  compact = false,
}: OrderFormFieldsProps) => {
  const { formState, warnings, formSetters } = model;

  const [showMore, setShowMore] = useState(false);

  return (
    <form
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 scroll-thin bg-[var(--color-ligth-bg)] ${
        compact ? "pb-5" : "h-full pb-[100px]"
      }`}
    >
      <div className=" rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm">
        <Cell>
          <Field
            warningPlacement="besidesLabel"
            label="Email:"
            required={true}
            warningController={warnings.emailWarning}
          >
            <InputField
              value={formState.client_email}
              onChange={formSetters.handleEmail}
              warningController={warnings.emailWarning}
              fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
              inputClassName={PLAIN_INPUT_CLASS}
            />
          </Field>
        </Cell>

        <SplitRow
          splitRowClass={
            "grid grid-cols-2 divide-x divide-[var(--color-border-accent)]"
          }
        >
          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Phone:"
              required={true}
              warning={warnings.primaryPhoneWarning.warning}
            >
              <PhoneField
                phoneNumber={formState.client_primary_phone}
                onChange={formSetters.handlePrimaryPhone}
              />
            </Field>
          </Cell>

          <Cell>
            <Field warningPlacement="besidesLabel" label="Secondary Phone:">
              <PhoneField
                phoneNumber={formState.client_secondary_phone}
                onChange={formSetters.handleSecondaryPhone}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow
          splitRowClass={
            "grid grid-cols-2 divide-x divide-[var(--color-border-accent)]"
          }
        >
          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Name:"
              required={true}
              warningController={warnings.firstNameWarning}
            >
              <InputField
                value={formState.client_first_name}
                onChange={formSetters.handleFirstName}
                warningController={warnings.firstNameWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Last Name:"
              required={true}
              warningController={warnings.lastNameWarning}
            >
              <InputField
                value={formState.client_last_name}
                onChange={formSetters.handleLastName}
                warningController={warnings.lastNameWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <div
          className={`border-t border-[var(--color-border-accent)] cell-default`}
        >
          <Field
            warningPlacement="besidesLabel"
            label="Address:"
            required={true}
            warning={warnings.addressWarning.warning}
          >
            <AddressAutocomplete
              onSelectedAddress={formSetters.handleAddress}
              selectedAddress={formState.client_address}
              fieldClassName={" flex w-full items-center"}
              containerClassName={" px-4 py-2  gap-2"}
              inputClassName={"text-sm w-full "}
              intentKey={"order-form-delivery-address"}
              enableCurrentLocation
              enableSavedLocations
            />
          </Field>
        </div>

        {showMore ? (
          <>
            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <Field
                warningPlacement="besidesLabel"
                label="General Note:"
                info="Internal note visible to the driver."
              >
                <InputField
                  value={formState.general_note}
                  onChange={formSetters.handleGeneralNote}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </div>

            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <Field
                warningPlacement="besidesLabel"
                label="Customer Note:"
                info="Customer-facing note imported from external order links."
              >
                <InputField
                  value={formState.customer_note}
                  onChange={formSetters.handleCustomerNote}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </div>
            <div
              className={`border-t border-[var(--color-border-accent)] cell-default`}
            >
              <Field
                warningPlacement="besidesLabel"
                label="Reference number:"
                required={true}
                warningController={warnings.referenceWarning}
              >
                <InputField
                  value={formState.reference_number ?? ""}
                  onChange={formSetters.handleReference}
                  warningController={warnings.referenceWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </div>

            <div
              className={`border-t border-[var(--color-border-accent)] px-3 py-2`}
            >
              <Field warningPlacement="besidesLabel" label="External source:">
                <InputField
                  value={formState.external_source}
                  onChange={formSetters.handleExternalSource}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </div>

            <SplitRow
              splitRowClass={
                "grid grid-cols-2 divide-x divide-[var(--color-border-accent)]"
              }
            >
              <Cell>
                <Field
                  warningPlacement="besidesLabel"
                  label="Ext. tracking #:"
                  info="Tracking number provided by Shopify or third-party courier."
                >
                  <InputField
                    value={formState.external_tracking_number}
                    onChange={formSetters.handleExternalTrackingNumber}
                    fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                    inputClassName={PLAIN_INPUT_CLASS}
                  />
                </Field>
              </Cell>
              <Cell>
                <Field
                  warningPlacement="besidesLabel"
                  label="Ext. tracking link:"
                  info="Tracking URL provided by Shopify or third-party courier."
                >
                  <InputField
                    value={formState.external_tracking_link}
                    onChange={formSetters.handleExternalTrackingLink}
                    fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                    inputClassName={PLAIN_INPUT_CLASS}
                  />
                </Field>
              </Cell>
            </SplitRow>

            {formState.delivery_plan_id == null ? (
              <div
                className={`border-t border-[var(--color-border-accent)] px-3 py-2`}
              >
                <Field
                  warningPlacement="besidesLabel"
                  label="Order plan objective:"
                  info={ORDER_PLAN_OBJECTIVE_INFO}
                >
                  <OptionPopoverSelect
                    options={ORDER_PLAN_OBJECTIVE_OPTIONS}
                    value={formState.order_plan_objective}
                    onChange={formSetters.handleOrderPlanObjective}
                    placeholder="Select objective"
                    emptyLabel="No objective"
                    inputFieldClassName="flex w-full justify-between items-center  px-2 pr-4 pb-2 "
                  />
                </Field>
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

      <OrderFormDeliveryWindowCalendar
        compact={compact}
        sizePreset={"desktopPopup550"}
      />
    </form>
  );
};
