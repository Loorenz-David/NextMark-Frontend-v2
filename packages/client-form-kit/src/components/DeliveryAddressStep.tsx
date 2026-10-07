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
import { DeliveryAddressLoadingField } from "./DeliveryAddressLoadingField";
import { ConsentSection } from "./ConsentSection";

const ADDRESS_LABELS = {
  currentLocation: "Min plats",
  useCurrentLocation: "Använd min nuvarande plats",
  searching: "Söker…",
  noMatches: "Inga träffar. Prova att skriva adressen mer exakt.",
};

export const DeliveryAddressStep = () => {
  const { config, data, setField, goToStep, requestSubmit, options } =
    useClientForm();
  // With rules, consent and the submit action move to the end of the rules
  // gate, so this step only leads into it.
  const hasRules = config.rules.length > 0;
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
      await requestSubmit();
      return;
    }

    const typed = typedInputRef.current.trim();
    if (!typed) {
      setGeocodeError("Skriv in eller välj en leveransadress.");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await getPlacePredictionsQuery(
        { ensureServices: servicesRef.current.ensureServices },
        {
          input: typed,
          componentRestrictions: options.addressCountryRestriction
            ? { country: options.addressCountryRestriction }
            : undefined,
        },
      );

      if (!result.suggestions.length) {
        setGeocodeError(
          "Vi hittade inte adressen. Välj ett av förslagen.",
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
      // Passed explicitly: the `setField` above has not landed in provider state
      // yet, so submitting on the current `data` would drop the geocoded address.
      await requestSubmit({ client_address: geocodedAddress });
    } catch {
      setGeocodeError(
        "Det gick inte att kontrollera adressen. Välj ett av förslagen i listan.",
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
            <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
              Leveransadress
            </span>
            <AddressAutocomplete
              selectedAddress={selectedAddress}
              onSelectedAddress={handleAddressSelected}
              onInputValueChange={(v) => {
                typedInputRef.current = v;
              }}
              onCurrentLocationLoadingChange={setIsResolvingCurrentLocation}
              enableCurrentLocation
              componentRestrictions={
                options.addressCountryRestriction
                  ? { country: options.addressCountryRestriction }
                  : undefined
              }
              enableSavedLocations={options.enableSavedLocations}
              intentKey={options.savedLocationsIntentKey}
              placeholder="Sök adress…"
              labels={ADDRESS_LABELS}
              renderInPortal
              popoverClassName="z-[1000] client-form-portal"
              currentLocationIconClassName="text-[var(--ink)]"
              embedCurrentLocationIcon
              storageNamespace={options.storageNamespace}
            />
          </label>

          {isResolvingCurrentLocation && !selectedAddress ? (
            <DeliveryAddressLoadingField />
          ) : null}

          {selectedAddress && !isResolvingCurrentLocation ? (
            // The labels are tracked-out uppercase, so at the touch scale two
            // of these columns no longer fit a phone — they stack until there
            // is room for both.
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                  Ort
                </span>
                <p className="rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] text-[length:var(--cf-input)] text-[var(--ink)]">
                  {selectedAddress.city || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                  Postnummer
                </span>
                <p className="rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] text-[length:var(--cf-input)] text-[var(--ink)]">
                  {selectedAddress.postal_code || "—"}
                </p>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                  Land
                </span>
                <p className="rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] text-[length:var(--cf-input)] text-[var(--ink)]">
                  {selectedAddress.country || "—"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {options.collectOrderNotes ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
              Leveransinstruktioner{" "}
              <span className="normal-case text-[var(--ink-faint)]">(valfritt)</span>
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
        ) : null}

        {geocodeError && (
          <p className="text-[length:var(--cf-body)] text-[var(--danger)]">{geocodeError}</p>
        )}

        {hasRules ? null : <ConsentSection />}
      </div>

      <div className="flex justify-between">
        <StepButton
          label="Tillbaka"
          variant="ghost"
          onClick={() => goToStep("contact_info")}
        />
        <StepButton
          label={isGeocoding ? "Kontrollerar…" : hasRules ? "Nästa" : "Skicka"}
          onClick={handleSubmit}
          disabled={isGeocoding}
        />
      </div>
    </div>
  );
};
