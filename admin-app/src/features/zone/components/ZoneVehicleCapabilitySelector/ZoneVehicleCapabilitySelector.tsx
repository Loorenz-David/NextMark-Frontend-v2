import { useMemo, useState } from "react";

import { ObjectLinkSelector } from "@/shared/inputs/ObjectLinkSelector";

import {
  filterZoneVehicleCapabilitySelectorItems,
  getZoneVehicleCapabilitySelectorItems,
  parseZoneVehicleCapabilitySelection,
  serializeZoneVehicleCapabilitySelection,
} from "../../domain/zoneVehicleCapabilitySelector.domain";
import type { ZoneVehicleCapability } from "../../domain/zoneEnums";

type ZoneVehicleCapabilitySelectorProps = {
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
};

const allCapabilityItems = getZoneVehicleCapabilitySelectorItems();

export const ZoneVehicleCapabilitySelector = ({
  selectedValue,
  onSelectionChange,
  placeholder = "Select capabilities",
  containerClassName,
}: ZoneVehicleCapabilitySelectorProps) => {
  const [query, setQuery] = useState("");

  const selectedCapabilities = useMemo(
    () => parseZoneVehicleCapabilitySelection(selectedValue),
    [selectedValue],
  );

  const selectedItems = useMemo(() => {
    const selectedCapabilitySet = new Set(selectedCapabilities);

    return allCapabilityItems.filter((item) =>
      selectedCapabilitySet.has(item.id as ZoneVehicleCapability),
    );
  }, [selectedCapabilities]);

  const options = useMemo(
    () => filterZoneVehicleCapabilitySelectorItems(allCapabilityItems, query),
    [query],
  );

  return (
    <ObjectLinkSelector
      mode="multi"
      options={options}
      selectedItems={selectedItems}
      queryValue={query}
      onQueryChange={setQuery}
      placeholder={placeholder}
      containerClassName={containerClassName}
      emptyOptionsMessage="No capabilities found."
      emptySelectedMessage="No selected capabilities."
      selectedOverlayTitle="Selected capabilities"
      selectedButtonLabel="Capabilities"
      onSelectItem={(item) => {
        setQuery("");
        const capabilityId = item.id as ZoneVehicleCapability;

        const nextCapabilities = Array.from(
          new Set([
            ...selectedCapabilities,
            capabilityId,
          ]),
        );

        onSelectionChange(
          serializeZoneVehicleCapabilitySelection(nextCapabilities),
        );
      }}
      onRemoveSelectedItem={(item) => {
        setQuery("");
        const capabilityId = item.id as ZoneVehicleCapability;

        onSelectionChange(
          serializeZoneVehicleCapabilitySelection(
            selectedCapabilities.filter(
              (capability) => capability !== capabilityId,
            ),
          ),
        );
      }}
    />
  );
};
