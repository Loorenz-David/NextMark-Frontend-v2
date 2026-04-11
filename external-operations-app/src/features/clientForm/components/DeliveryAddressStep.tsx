import { useRef, useState } from "react";
import { AddressAutocomplete } from "@shared-inputs";
import type { address } from "@shared-domain/core/address";
import {
  getPlacePredictionsQuery,
  getPlaceDetailsQuery,
  createGooglePlacesServiceAccess,
} from "@shared-google-maps";
import { useClientForm } from "../context/useClientForm";
import { StepButton } from "./StepButton";
import {
  CLIENT_FORM_SAVED_LOCATIONS_INTENT_KEY,
  CLIENT_FORM_STORAGE_NAMESPACE,
} from "../constants/storage";
import { DeliveryAddressLoadingField } from "./DeliveryAddressLoadingField";

export const DeliveryAddressStep = () => {
  const { data, setField, goToStep, submit } = useClientForm();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] =
    useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const typedInputRef = useRef("");
  const servicesRef = useRef(createGooglePlacesServiceAccess());

  const selectedAddress = data.client_address;

  const handleAddressSelected = (value: address | null) => {
    setGeocodeError(null);
    if (value) {
      setField("client_address", value);
    } else {
      setField("client_address", null);
    }
  };

  const handleSubmit = async () => {
    if (selectedAddress) {
      await submit();
      return;
    }

    const typed = typedInputRef.current.trim();
    if (!typed) {
      setGeocodeError("Please enter or select a delivery address.");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await getPlacePredictionsQuery(
        { ensureServices: servicesRef.current.ensureServices },
        { input: typed },
      );

      if (!result.suggestions.length) {
        setGeocodeError(
          "Address not found. Please select from the suggestions.",
        );
        return;
      }

      const details = await getPlaceDetailsQuery(
        {
          ensureServices: servicesRef.current.ensureServices,
          resetSessionToken: servicesRef.current.resetSessionToken,
        },
        result.suggestions[0].placeId,
      );

      const geocodedAddress: address = {
        street_address: details.raw_address,
        city: details.city,
        country: details.country,
        postal_code: details.postal_code,
        coordinates: details.coordinates,
      };

      setField("client_address", geocodedAddress);
      // Immediately submit with the geocoded address
      await submit();
    } catch {
      setGeocodeError(
        "Could not verify address. Please select from the suggestions dropdown.",
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-12 pt-5">
      <div className="space-y-8">
        <div className="space-y-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
              Street address
            </span>
            <AddressAutocomplete
              selectedAddress={selectedAddress}
              onSelectedAddress={handleAddressSelected}
              onInputValueChange={(v) => {
                typedInputRef.current = v;
              }}
              onCurrentLocationLoadingChange={setIsResolvingCurrentLocation}
              enableCurrentLocation
              enableSavedLocations
              intentKey={CLIENT_FORM_SAVED_LOCATIONS_INTENT_KEY}
              placeholder="Search address..."
              renderInPortal
              popoverClassName="z-[1000]"
              currentLocationIconClassName="text-white"
              embedCurrentLocationIcon
              storageNamespace={CLIENT_FORM_STORAGE_NAMESPACE}
            />
          </label>

          {isResolvingCurrentLocation && !selectedAddress ? (
            <DeliveryAddressLoadingField />
          ) : null}

          {selectedAddress && !isResolvingCurrentLocation ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
                  City
                </span>
                <p className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/80">
                  {selectedAddress.city || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
                  Postal code
                </span>
                <p className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/80">
                  {selectedAddress.postal_code || "—"}
                </p>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
                  Country
                </span>
                <p className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/80">
                  {selectedAddress.country || "—"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
            Delivery notes{" "}
            <span className="normal-case text-white/28">(optional)</span>
          </span>
          <div className="custom-field-container">
            <input
              className="custom-input"
              value={data.order_notes}
              onChange={(e) => setField("order_notes", e.target.value)}
              placeholder=""
            />
          </div>
        </label>

        {geocodeError && (
          <p className="text-sm text-rose-400">{geocodeError}</p>
        )}
      </div>

      <div className="flex justify-between">
        <StepButton
          label="Back"
          variant="ghost"
          onClick={() => goToStep("contact_info")}
        />
        <StepButton
          label={isGeocoding ? "Verifying…" : "Submit"}
          onClick={handleSubmit}
          disabled={isGeocoding}
        />
      </div>
    </div>
  );
};
