import type { Dispatch, SetStateAction } from "react";
import type { ChangeEvent } from "react";
import type { DeliveryPlan, PlanDateStrategy } from "../../types/plan";
import type { PlanWarningsControllers } from "./PlanForm.types";
import type { CustomDatePickerIsoRange } from "@/shared/inputs/CustomDatePicker";
type SetDeliveryPlanState = Dispatch<SetStateAction<DeliveryPlan>>;

type PropsUsePlanFormSetters = {
  setPlanForm: SetDeliveryPlanState;
  setSelectedZoneIds: Dispatch<SetStateAction<number[]>>;
  planFormWarnings: PlanWarningsControllers;
};

export const usePlanFormSetters = ({
  setPlanForm,
  setSelectedZoneIds,
  planFormWarnings,
}: PropsUsePlanFormSetters) => {
  const handlePlanType = () => undefined;
  const handlePlanName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    planFormWarnings.planNameWarning.validate(value);
    setPlanForm((prev) => ({ ...prev, label: value }));
  };

  const handleStartDate = (value: string) => {
    setPlanForm((prev) => {
      const { end_date, date_strategy } = prev;
      planFormWarnings.planStartDateWarning.validate({
        start_date: value,
        end_date: date_strategy === "range" ? end_date : null,
      });

      return { ...prev, start_date: value };
    });
  };
  const handleEndDate = (value: string) => {
    setPlanForm((prev) => {
      const { start_date, date_strategy } = prev;
      planFormWarnings.planStartDateWarning.validate({
        start_date,
        end_date: date_strategy === "range" ? value : null,
      });

      return { ...prev, end_date: value };
    });
  };

  const handleZoneSelectionToggle = (zoneId: number, checked: boolean) => {
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      return;
    }

    setSelectedZoneIds((prev) => {
      if (checked) {
        return prev.includes(zoneId) ? prev : [...prev, zoneId];
      }
      return prev.filter((id) => id !== zoneId);
    });
  };

  const handleZoneSelectionChange = (nextZoneIds: Array<number | string>) => {
    const normalizedIds = nextZoneIds
      .map((zoneId) =>
        typeof zoneId === "number" ? zoneId : Number.parseInt(String(zoneId), 10),
      )
      .filter((zoneId) => Number.isInteger(zoneId) && zoneId > 0);

    setSelectedZoneIds(Array.from(new Set(normalizedIds)));
  };

  const handleDateStrategy = (strategy: PlanDateStrategy) => {
    setPlanForm((prev) => {
      const nextStartDate = prev.start_date ?? null;
      const nextEndDate = strategy === "range" ? prev.end_date ?? null : null;

      planFormWarnings.planStartDateWarning.validate({
        start_date: nextStartDate,
        end_date: strategy === "range" ? nextEndDate : null,
      });

      return {
        ...prev,
        date_strategy: strategy,
        end_date: nextEndDate,
      };
    });
  };

  const handleCompositeDateStrategy = (strategy: PlanDateStrategy) => {
    handleDateStrategy(strategy);
  };

  const handleCompositeSingleDate = (value: string | null) => {
    handleStartDate(value ?? "");
  };

  const handleCompositeRange = (value: CustomDatePickerIsoRange) => {
    setPlanForm((prev) => {
      const nextStartDate = value.start ?? prev.start_date ?? null;
      const nextEndDate = value.end ?? null;

      planFormWarnings.planStartDateWarning.validate({
        start_date: nextStartDate,
        end_date: nextEndDate,
      });

      return {
        ...prev,
        date_strategy: "range",
        start_date: nextStartDate,
        end_date: nextEndDate,
      };
    });
  };

  return {
    handlePlanType,
    handlePlanName,
    handleStartDate,
    handleEndDate,
    handleZoneSelectionToggle,
    handleZoneSelectionChange,
    handleDateStrategy,
    handleCompositeDateStrategy,
    handleCompositeSingleDate,
    handleCompositeRange,
  };
};
