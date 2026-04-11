import { ZoneSelector } from "@/features/zone";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { CustomDatePicker } from "@/shared/inputs/CustomDatePicker";
import { InputWarning } from "@/shared/inputs/InputWarning";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";

import { usePlanForm } from "./PlanForm.context";
import { Cell } from "@/shared/layout/cells";

export const PlanFormLayout = () => {
  const {
    mode,
    planForm,
    selectedZoneIds,
    planSetters,
    planActions,
    planFormWarnings,
  } = usePlanForm();

  return (
    <>
      <form
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 scroll-thin bg-[var(--color-ligth-bg)] h-full pb-[100px]`}
        action=""
      >
        <div className=" flex flex-col gap-4 px-4 py-4 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm mb-4">
          <Field
            warningPlacement="besidesLabel"
            label="Plan name:"
            required={true}
            warning={planFormWarnings.planNameWarning.warning}
            warningController={planFormWarnings.planNameWarning}
          >
            <InputField
              value={planForm.label}
              onChange={planSetters.handlePlanName}
            />
          </Field>

          <Field label="Plan date:" required={true}>
            <CustomDatePicker
              selectionMode="single_or_range"
              strategy={planForm.date_strategy === "range" ? "range" : "single"}
              date={
                planForm.start_date ? new Date(planForm.start_date) : new Date()
              }
              rangeValue={{
                start: planForm.start_date
                  ? new Date(planForm.start_date)
                  : new Date(),
                end: planForm.end_date ? new Date(planForm.end_date) : null,
              }}
              onChange={planSetters.handleCompositeSingleDate}
              onRangeChange={planSetters.handleCompositeRange}
              onStrategyChange={planSetters.handleCompositeDateStrategy}
              disablePast
              renderPopoverInPortal
            />
          </Field>

          <Field label="Zones:">
            <ZoneSelector
              mode="multi"
              selectedZoneIds={selectedZoneIds}
              onSelectionChange={planSetters.handleZoneSelectionChange}
            />
          </Field>
        </div>
        {planFormWarnings.planStartDateWarning?.warning && (
          <InputWarning {...planFormWarnings.planStartDateWarning.warning} />
        )}
      </form>
      <FeaturePopupFooter>
        {mode === "edit" ? (
          <ConfirmActionButton
            onConfirm={planActions.handleDeletePlan}
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
        {mode === "create" ? (
          <div className="flex flex-1 justify-end">
            <BasicButton
              params={{
                variant: "primary",
                className: "py-2 px-5",
                onClick: planActions.handleCreatePlan,
              }}
            >
              Create Plan
            </BasicButton>
          </div>
        ) : null}
      </FeaturePopupFooter>
    </>
  );
};
