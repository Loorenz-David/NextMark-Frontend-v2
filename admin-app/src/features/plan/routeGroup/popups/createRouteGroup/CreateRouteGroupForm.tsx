import type { StackComponentProps } from "@/shared/stack-manager/types";

import type { CreateRouteGroupFormPopupPayload } from "@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types";
import { CreateRouteGroupFormPopup } from "./CreateRouteGroupFormPopup";

export const CreateRouteGroupForm = ({
  payload,
  onClose,
}: StackComponentProps<CreateRouteGroupFormPopupPayload>) => (
  <CreateRouteGroupFormPopup payload={payload} onClose={onClose} />
);
