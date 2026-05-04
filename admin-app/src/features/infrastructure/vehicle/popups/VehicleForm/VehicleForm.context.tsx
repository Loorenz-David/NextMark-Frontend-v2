import { createContext, useContext } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import type { VehicleFormPayload, VehicleFormState } from "./VehicleForm.types";
import type { VehicleFormWarnings } from "./VehicleForm.warnings";

type VehicleFormContextValue = {
  payload: VehicleFormPayload;
  formState: VehicleFormState;
  setFormState: Dispatch<SetStateAction<VehicleFormState>>;
  initialFormRef: RefObject<VehicleFormState | null>;
  warnings: VehicleFormWarnings;
  handleSave: () => void;
  handleDelete: () => void;
};

const VehicleFormContext = createContext<VehicleFormContextValue | null>(null);

export const useVehicleForm = () => {
  const context = useContext(VehicleFormContext);
  if (!context) {
    throw new Error("useVehicleForm must be used within VehicleFormProvider.");
  }
  return context;
};

export const useVehicleFormContextValue = () => VehicleFormContext;
