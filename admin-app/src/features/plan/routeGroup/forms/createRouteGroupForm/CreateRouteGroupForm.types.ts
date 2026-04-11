import type { useCreateRouteGroupController } from "@/features/plan/routeGroup/controllers/useCreateRouteGroup.controller";

export type CreateRouteGroupFormState = {
  name: string;
  zone_id: number | null;
};

export type CreateRouteGroupFormPopupPayload = {
  planId: number;
};

export type CreateRouteGroupFormErrors = {
  name?: string;
};

export type CreateRouteGroupZoneOption = {
  id: number;
  name: string;
  disabled: boolean;
  assignedGroupName: string | null;
};

export type CreateRouteGroupFormContextValue = {
  planId: number;
  formState: CreateRouteGroupFormState;
  formErrors: CreateRouteGroupFormErrors;
  shouldShowErrors: boolean;
  hasUnsavedChanges: boolean;
  availableZones: CreateRouteGroupZoneOption[];
  isSubmitting: boolean;
  formSetters: {
    setName: (name: string) => void;
    setZoneId: (zone_id: number | null, zoneName?: string | null) => void;
  };
  actions: {
    handleSubmit: () => Promise<boolean>;
  };
};

export type CreateRouteGroupFormActions = ReturnType<
  typeof useCreateRouteGroupController
>;
