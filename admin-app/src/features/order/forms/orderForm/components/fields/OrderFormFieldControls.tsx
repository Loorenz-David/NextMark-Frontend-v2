import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { OptionPopoverSelect } from "@/shared/inputs/OptionPopoverSelect";
import { PhoneField } from "@/shared/inputs/PhoneField";
import { Switch } from "@/shared/inputs/Switch";
import { AddressAutocomplete } from "@/shared/inputs/address-autocomplete/AddressAutocomplete";

import { ORDER_PLAN_OBJECTIVE_INFO } from "../../info/orderPlanObjective.info";
import {
  ORDER_PLAN_OBJECTIVE_OPTIONS,
  type OrderFormLayoutModel,
} from "../../OrderForm.layout.model";

/**
 * One control per order field, wired to the layout model. The desktop and
 * phone layouts compose these differently; the field definitions live here
 * so a new field is added once.
 */
type FieldControlProps = {
  model: OrderFormLayoutModel;
};

export const OrderFormEmailField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Email:"
    required={true}
    warningController={model.warnings.emailWarning}
  >
    <InputField
      value={model.formState.client_email}
      onChange={model.formSetters.handleEmail}
      warningController={model.warnings.emailWarning}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormPrimaryPhoneField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Phone:"
    required={true}
    warning={model.warnings.primaryPhoneWarning.warning}
  >
    <PhoneField
      phoneNumber={model.formState.client_primary_phone}
      onChange={model.formSetters.handlePrimaryPhone}
    />
  </Field>
);

export const OrderFormSecondaryPhoneField = ({ model }: FieldControlProps) => (
  <Field warningPlacement="besidesLabel" label="Secondary Phone:">
    <PhoneField
      phoneNumber={model.formState.client_secondary_phone}
      onChange={model.formSetters.handleSecondaryPhone}
    />
  </Field>
);

export const OrderFormFirstNameField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Name:"
    required={true}
    warningController={model.warnings.firstNameWarning}
  >
    <InputField
      value={model.formState.client_first_name}
      onChange={model.formSetters.handleFirstName}
      warningController={model.warnings.firstNameWarning}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormLastNameField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Last Name:"
    required={true}
    warningController={model.warnings.lastNameWarning}
  >
    <InputField
      value={model.formState.client_last_name}
      onChange={model.formSetters.handleLastName}
      warningController={model.warnings.lastNameWarning}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormAddressField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Address:"
    required={true}
    warning={model.warnings.addressWarning.warning}
  >
    <AddressAutocomplete
      onSelectedAddress={model.formSetters.handleAddress}
      selectedAddress={model.formState.client_address}
      fieldClassName={" flex w-full items-center"}
      containerClassName={" px-4 py-2  gap-2"}
      inputClassName={"text-sm w-full "}
      intentKey={"order-form-delivery-address"}
      enableCurrentLocation
      enableSavedLocations
    />
  </Field>
);

export const OrderFormGeneralNoteField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="General Note:"
    info="Internal note visible to the driver."
  >
    <InputField
      value={model.formState.general_note}
      onChange={model.formSetters.handleGeneralNote}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormHelpToCarryField = ({ model }: FieldControlProps) => (
  <Field warningPlacement="besidesLabel" label="Help to carry:">
    <div className="">
      <Switch
        value={model.formState.help_to_carry}
        onChange={model.formSetters.handleHelpToCarry}
        ariaLabel="Help to carry"
      />
    </div>
  </Field>
);

export const OrderFormCustomerNoteField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Customer Note:"
    info="Customer-facing note imported from external order links."
  >
    <InputField
      value={model.formState.customer_note}
      onChange={model.formSetters.handleCustomerNote}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormMarketingMessagesField = ({
  model,
}: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Marketing messages:"
    info="The customer's opt-in, as given on the client form. Editing it here records a change of mind, not a new consent."
  >
    <div className="">
      <Switch
        value={model.formState.marketing_messages}
        onChange={model.formSetters.handleMarketingMessages}
        ariaLabel="Marketing messages"
      />
    </div>
  </Field>
);

export const OrderFormReferenceField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Reference number:"
    required={true}
    warningController={model.warnings.referenceWarning}
  >
    <InputField
      value={model.formState.reference_number ?? ""}
      onChange={model.formSetters.handleReference}
      warningController={model.warnings.referenceWarning}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormExternalSourceField = ({ model }: FieldControlProps) => (
  <Field warningPlacement="besidesLabel" label="External source:">
    <InputField
      value={model.formState.external_source}
      onChange={model.formSetters.handleExternalSource}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormExternalTrackingNumberField = ({
  model,
}: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Ext. tracking #:"
    info="Tracking number provided by Shopify or third-party courier."
  >
    <InputField
      value={model.formState.external_tracking_number}
      onChange={model.formSetters.handleExternalTrackingNumber}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

export const OrderFormExternalTrackingLinkField = ({
  model,
}: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Ext. tracking link:"
    info="Tracking URL provided by Shopify or third-party courier."
  >
    <InputField
      value={model.formState.external_tracking_link}
      onChange={model.formSetters.handleExternalTrackingLink}
      fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
      inputClassName={PLAIN_INPUT_CLASS}
    />
  </Field>
);

/** Only meaningful while the order is not yet on a plan. */
export const OrderFormPlanObjectiveField = ({ model }: FieldControlProps) => (
  <Field
    warningPlacement="besidesLabel"
    label="Order plan objective:"
    info={ORDER_PLAN_OBJECTIVE_INFO}
  >
    <OptionPopoverSelect
      options={ORDER_PLAN_OBJECTIVE_OPTIONS}
      value={model.formState.order_plan_objective}
      onChange={model.formSetters.handleOrderPlanObjective}
      placeholder="Select objective"
      emptyLabel="No objective"
      inputFieldClassName="flex w-full justify-between items-center  px-2 pr-4 pb-2 "
    />
  </Field>
);
