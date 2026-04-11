import type { ChangeEvent, Dispatch, SetStateAction } from "react";

import type { Item } from "../../types";
import type { ItemFormWarnings } from "./ItemForm.types";

export const useItemFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<Item>>;
  warnings: ItemFormWarnings;
}) => {
  const handleArticleNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, article_number: value }));
    warnings.articleNumberWarning.validate(value);
  };

  const handleItemTypeValue = (value: { name: string } | string) => {
    const itemTypeName = typeof value === "string" ? value : value.name;
    setFormState((prev) => ({ ...prev, item_type: itemTypeName }));
    warnings.itemTypeWarning.validate(itemTypeName);
  };

  const handleItemTypeSelection = (itemType: { name: string }) => {
    handleItemTypeValue(itemType.name);
  };

  const handlePropertyValue = (
    propertyName: string,
    value: string | number | boolean | null,
  ) => {
    setFormState((prev) => {
      const nextProperties = { ...(prev.properties ?? {}) };

      if (value === null || value === "") {
        delete nextProperties[propertyName];
      } else {
        nextProperties[propertyName] = value;
      }

      return {
        ...prev,
        properties: Object.keys(nextProperties).length ? nextProperties : null,
      };
    });
  };

  const handleQuantity = (value: number) => {
    const quantity = Number.isFinite(value) && value > 0 ? value : 0;
    setFormState((prev) => ({ ...prev, quantity }));
    warnings.quantityWarning.validate(quantity);
  };

  const handleWeight = (value: number) => {
    const weight = Number.isFinite(value) ? value : null;
    setFormState((prev) => ({ ...prev, weight }));
  };

  const handleDimension = (
    key: "dimension_width" | "dimension_height" | "dimension_depth",
    value: number,
  ) => {
    const dimensionValue = Number.isFinite(value) ? value : null;
    setFormState((prev) => ({ ...prev, [key]: dimensionValue }));
  };

  return {
    handleArticleNumber,
    handleItemTypeValue,
    handleItemTypeSelection,
    handlePropertyValue,
    handleQuantity,
    handleWeight,
    handleDimension,
  };
};
