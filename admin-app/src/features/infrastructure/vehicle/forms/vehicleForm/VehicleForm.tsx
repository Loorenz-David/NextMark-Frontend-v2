import { useMemo } from "react";

import { PopupFooter } from "@/shared/popups/MainPopup/PopupFooter";

import { useVehicleForm } from "../../popups/VehicleForm/VehicleForm.context";
import { useVehicleFormConfig } from "../../popups/VehicleForm/useVehicleFormConfig";

import { VehicleFormFields } from "./components/VehicleFormFields";

export const VehicleFormFeature = () => {
  const { payload, formState, handleSave, handleDelete, initialFormRef } =
    useVehicleForm();

  useVehicleFormConfig({ formState, initialFormRef, payload });

  const footerConfig = useMemo(
    () => ({
      saveButton: {
        label: payload.mode === "create" ? "Create vehicle" : "Save vehicle",
        action: handleSave,
      },
      ...(payload.mode === "edit"
        ? { deleteButton: { label: "Delete vehicle", action: handleDelete } }
        : {}),
    }),
    [handleDelete, handleSave, payload.mode],
  );

  return (
    <>
      <form className="flex h-full flex-col gap-5 overflow-y-auto overflow-x-visible px-2 pb-[88px] scroll-thin">
        <VehicleFormFields />
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  );
};
