import { useState } from "react";

import { AddressAutocomplete } from "@/shared/inputs/address-autocomplete/AddressAutocomplete";
import { Field } from "@/shared/inputs/FieldContainer";

import { useExternalForm } from "../context";
import { DeliveryAddressLoadingField } from "./DeliveryAddressLoadingField";
import { StepButton } from "./StepButton";

export const DeliveryAddressStep = () => {
  const { form, setters, submit, warnings } = useExternalForm();
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] =
    useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Delivery Address</h2>
        <p className="mt-1 text-sm text-white/46">
          Choose where this order should be delivered.
        </p>
      </div>

      <Field
        label="Address:"
        required={true}
        warning={warnings.addressWarning.warning}
      >
        <div className="relative">
          <AddressAutocomplete
            selectedAddress={form.client_address}
            enableCurrentLocation
            onCurrentLocationLoadingChange={setIsResolvingCurrentLocation}
            onSelectedAddress={(value) => {
              setters.setAddress(value);
            }}
          />
          {isResolvingCurrentLocation ? <DeliveryAddressLoadingField /> : null}
        </div>
      </Field>

      <div className="pt-3 flex justify-end">
        <StepButton label="Submit" onClick={submit} />
      </div>
    </div>
  );
};
