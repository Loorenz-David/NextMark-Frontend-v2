import { useMemo } from "react";
import type { CSSProperties } from "react";

import { AddressAutocomplete as SharedAddressAutocomplete } from "@shared-inputs";
import type { ComponentRestrictions } from "@shared-google-maps";
import type { address } from "@/types/address";

import { sessionLocationService } from "@/app/services/sessionLocation.service";

type AddressAutocompleteProps = {
  onSelectedAddress: (value: address | null) => void;
  selectedAddress: address | null | undefined;
  componentRestrictions?: ComponentRestrictions;
  defaultToCurrentLocation?: boolean;
  enableCurrentLocation?: boolean;
  enableSavedLocations?: boolean;
  intentKey?: string;
  fieldClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  inputStyle?: CSSProperties;
  placeholder?: string;
  onInputValueChange?: (value: string) => void;
  renderInPortal?: boolean;
  popoverClassName?: string;
  currentLocationIconClassName?: string;
  embedCurrentLocationIcon?: boolean;
  storageNamespace?: string;
};

export const AddressAutocomplete = ({
  componentRestrictions,
  ...props
}: AddressAutocompleteProps) => {
  const sessionCountryCode = sessionLocationService.getCountryCode();

  const resolvedComponentRestrictions = useMemo<ComponentRestrictions | undefined>(() => {
    if (componentRestrictions) {
      return componentRestrictions;
    }

    if (sessionCountryCode) {
      return { country: sessionCountryCode.toLowerCase() };
    }

    return undefined;
  }, [componentRestrictions, sessionCountryCode]);

  return (
    <SharedAddressAutocomplete
      {...props}
      componentRestrictions={resolvedComponentRestrictions}
    />
  );
};
