import { CreateRouteGroupFormLayout } from "./CreateRouteGroupForm.layout";
import { CreateRouteGroupFormProvider } from "./CreateRouteGroupForm.provider";
import type { CreateRouteGroupFormPopupPayload } from "./CreateRouteGroupForm.types";

export const CreateRouteGroupFormFeature = ({
  payload,
  onSuccessClose,
  onUnsavedChangesChange,
}: {
  payload?: CreateRouteGroupFormPopupPayload;
  onSuccessClose?: () => void | Promise<void>;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}) => (
  <CreateRouteGroupFormProvider
    payload={payload}
    onSuccessClose={onSuccessClose}
    onUnsavedChangesChange={onUnsavedChangesChange}
  >
    <CreateRouteGroupFormLayout />
  </CreateRouteGroupFormProvider>
);
