import { useMemo } from "react";

import { buildClientId } from "@/lib/utils/clientId";

import type { DeliveryPlan } from "../../types/plan";

import { usePlanStateRegistryFlow } from "../../flows/planStateRegistry.flow";
import { formatIsoDateFriendly } from "@/shared/utils/formatIsoDate";

const createInitialPlanForm = (
  planStateId: number | null | undefined,
): DeliveryPlan => {
  const nowIso = new Date().toISOString();

  const planLabel = `Plan for ${formatIsoDateFriendly(nowIso)}`;
  return {
    client_id: buildClientId("delivery_plan"),
    label: planLabel,
    start_date: nowIso,
    end_date: nowIso,
    state_id: planStateId ?? null,
    date_strategy: "single" as const,
  };
};

export const usePlanFormBootstrapFlow = () => {
  const stateRegistry = usePlanStateRegistryFlow();

  return useMemo(() => {
    const openPlanStateId = stateRegistry.getByName("Open")?.id ?? null;
    const initialPlanForm = createInitialPlanForm(openPlanStateId);

    return {
      initialPlanForm,
    };
  }, [stateRegistry]);
};
