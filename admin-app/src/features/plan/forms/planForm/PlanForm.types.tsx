import type { DeliveryPlan } from "../../types/plan";

import type { RouteGroupInput } from "../../routeGroup/types/routeGroup";
import { usePlanFormWarnings } from "./PlanForm.warnings";
import { usePlanFormActions } from "./planForm.actions";
import type { usePlanFormSetters } from "./planForm.setters";

export type PlanFormMode = "create" | "edit";

export type PopupPayload = {
  clientId?: string;
  serverId?: number;
  mode: PlanFormMode;
  selectedOrderServerIds?: number[];
  source?: "order_multi_select";
};

export type PlanTypeState = RouteGroupInput;

export type PropsPlanFormContext = {
  planForm: DeliveryPlan;
  selectedZoneIds: number[];
  mode: PlanFormMode;
  planSetters: ReturnType<typeof usePlanFormSetters>;
  planActions: ReturnType<typeof usePlanFormActions>;
  planFormWarnings: PlanWarningsControllers;
  hasUnsavedChanges: boolean;
};

export type PlanWarningsControllers = ReturnType<typeof usePlanFormWarnings>;

export type PlanFormActions = ReturnType<typeof usePlanFormActions>;
