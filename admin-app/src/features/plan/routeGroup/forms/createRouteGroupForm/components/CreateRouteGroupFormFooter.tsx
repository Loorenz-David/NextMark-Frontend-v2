import { BasicButton } from "@/shared/buttons/BasicButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";

import { useCreateRouteGroupForm } from "../CreateRouteGroupForm.context";

export const CreateRouteGroupFormFooter = () => {
  const { actions, isSubmitting } = useCreateRouteGroupForm();

  return (
    <FeaturePopupFooter>
      <div className="flex w-full justify-end">
        <BasicButton
          params={{
            variant: "primary",
            className: "px-5 py-2",
            onClick: () => {
              void actions.handleSubmit();
            },
            disabled: isSubmitting,
          }}
        >
          {isSubmitting ? "Creating..." : "Create Route Group"}
        </BasicButton>
      </div>
    </FeaturePopupFooter>
  );
};
