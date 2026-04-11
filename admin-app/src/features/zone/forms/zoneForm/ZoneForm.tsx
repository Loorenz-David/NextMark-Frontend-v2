import {
  ZoneFormLayout,
} from "./ZoneForm.layout";
import { useZoneForm } from "../../popups/ZoneForm/ZoneForm.context";
import { ZoneFormFields } from "./components/ZoneFormFields";

export const ZoneFormFeature = () => {
  const {
    payload,
    handleSave,
    handleDelete,
    handleCancel,
    isSubmitting,
    isDeleting,
  } = useZoneForm();

  return (
    <ZoneFormLayout
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      onSubmit={handleSave}
      onDelete={handleDelete ? () => void handleDelete() : undefined}
      onCancel={handleCancel}
      submitLabel={payload.mode === "create" ? "Create Zone" : "Save Changes"}
    >
      <ZoneFormFields />
    </ZoneFormLayout>
  );
};
