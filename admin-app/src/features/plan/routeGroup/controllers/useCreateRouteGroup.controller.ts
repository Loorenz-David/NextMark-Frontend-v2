import { useCallback, useState } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { useRoutePlanByServerId } from "@/features/plan/store/useRoutePlan.selector";
import { runCreateRouteGroupFlow } from "@/features/plan/routeGroup/flows/createRouteGroup.flow";
import type { CreateRouteGroupFormState } from "@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types";

export const useCreateRouteGroupController = (
  planId: number,
  onSuccessClose?: () => void | Promise<void>,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showMessage } = useMessageHandler();
  const plan = useRoutePlanByServerId(planId);

  const createRouteGroup = useCallback(
    async (formState: CreateRouteGroupFormState) => {
      if (isSubmitting) {
        return false;
      }

      setIsSubmitting(true);
      try {
        const result = await runCreateRouteGroupFlow({
          planId,
          plan,
          formState,
        });

        if (!result.ok) {
          showMessage({
            status: "error",
            message: result.error,
          });
          return false;
        }

        showMessage({
          status: "success",
          message: "Route group created.",
        });
        await onSuccessClose?.();
        return true;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onSuccessClose, plan, planId, showMessage],
  );

  return {
    isSubmitting,
    createRouteGroup,
  };
};
