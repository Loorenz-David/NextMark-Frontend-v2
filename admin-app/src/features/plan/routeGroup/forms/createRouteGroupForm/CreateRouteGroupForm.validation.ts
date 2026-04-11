import type {
  CreateRouteGroupFormErrors,
  CreateRouteGroupFormState,
} from "./CreateRouteGroupForm.types";

export const validateCreateRouteGroupForm = (
  state: CreateRouteGroupFormState,
): CreateRouteGroupFormErrors => {
  const errors: CreateRouteGroupFormErrors = {};

  if (!state.name.trim()) {
    errors.name = "Route group name is required";
  }

  return errors;
};

export const hasCreateRouteGroupFormErrors = (
  errors: CreateRouteGroupFormErrors,
) => Object.keys(errors).length > 0;
