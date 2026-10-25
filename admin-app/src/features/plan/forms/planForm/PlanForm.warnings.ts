import { useInputWarning } from "@/shared/inputs/useInputWarning.hook";
import { validateString } from "@shared-domain";
import {
  isDateOnOrAfterToday,
  validateDateComparison,
} from "@/shared/data-validation/timeValidation";

export const usePlanFormWarnings = () => {
  const planNameWarning = useInputWarning(
    "Plan must have a name",
    (value) => typeof value === 'string' && validateString(value),
  );

  const planStartDateWarning = useInputWarning(
    "Plan must have a start date",
    (value, setWarningMessage) => {
      if (
        typeof value !== 'object' || value === null ||
        !('start_date' in value) || typeof value.start_date !== 'string' ||
        !('end_date' in value) || typeof value.end_date !== 'string'
      ) return false
      const { start_date, end_date } = value
      if (!validateString(start_date)) {
        setWarningMessage("Plan must have a start date");
        return false;
      }
      if (!isDateOnOrAfterToday(start_date)) {
        setWarningMessage("Plan start date cannot be in the past");
        return false;
      }
      if (validateString(end_date) && !isDateOnOrAfterToday(end_date)) {
        setWarningMessage("Plan end date cannot be in the past");
        return false;
      }
      if (
        validateString(end_date) &&
        !validateDateComparison(start_date, end_date)
      ) {
        setWarningMessage("'From' date must be set before 'To' date");
        return false;
      }
      return true;
    },
  );

  return {
    planNameWarning,
    planStartDateWarning,
  };
};
