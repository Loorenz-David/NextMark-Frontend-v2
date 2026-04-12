import { BasicButton } from "@/shared/buttons";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";

import { useRouteGroupEditForm } from "../RouteGroupEditForm.context";

export const RouteGroupEditFormFooter = () => {
  const { hasMultipleVariants, actions } = useRouteGroupEditForm();

  return (
    <FeaturePopupFooter>
      {hasMultipleVariants ? (
        <ConfirmActionButton
          onConfirm={actions.handleDelete}
          deleteContent={"Delete"}
          confirmContent={"Confirm Deletion"}
          deleteClassName={
            "text-sm rounded-md bg-[var(--color-page)] text-red-500 border-[text-red-500] px-2 py-2"
          }
          confirmClassName={
            "text-sm rounded-md bg-red-500 py-2 px-2 text-white"
          }
        />
      ) : (
        <span />
      )}
      <div className="flex flex-1 justify-end">
        <BasicButton
          params={{
            variant: "primary",
            className: "py-2 px-5",
            onClick: actions.handleSave,
          }}
        >
          Save
        </BasicButton>
      </div>
    </FeaturePopupFooter>
  );
};
