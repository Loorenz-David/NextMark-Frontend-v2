import { useMemo, useState } from "react";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from "@/shared/popups/featurePopup";
import { CreateRouteGroupFormFeature } from "@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm";
import type { CreateRouteGroupFormPopupPayload } from "@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types";

export const CreateRouteGroupFormPopup = ({
  payload,
  onClose,
}: StackComponentProps<CreateRouteGroupFormPopupPayload>) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges,
    onClose,
  });

  const headerSubtitle = useMemo(
    () => "Create a route group and add a zone.",
    [],
  );

  return (
    <>
      <FeaturePopupShell
        onRequestClose={closeController.requestClose}
        size="mdNoHeight"
        variant="center"
      >
        <FeaturePopupHeader
          title="Create route group"
          subtitle={headerSubtitle}
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody>
          <CreateRouteGroupFormFeature
            payload={payload}
            onSuccessClose={closeController.confirmClose}
            onUnsavedChangesChange={setHasUnsavedChanges}
          />
        </FeaturePopupBody>
      </FeaturePopupShell>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  );
};
