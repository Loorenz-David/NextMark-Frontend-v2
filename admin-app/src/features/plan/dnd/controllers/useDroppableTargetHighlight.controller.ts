import { useMemo } from "react";

import { useDndContext } from "@dnd-kit/core";

import { resolvePlanIdByRouteGroupId } from "@/features/plan/dnd/domain/resolveRouteGroupPlanId";
import { resolveRouteGroupIdByRouteSolutionId } from "@/features/plan/dnd/domain/resolveRouteSolutionRouteGroupId";
import { resolveDraggedOrderOwnership } from "@/features/plan/dnd/domain/resolveDraggedOrderOwnership";

type UseDroppablePlanTargetHighlightParams = {
  isOver: boolean;
  targetPlanId: number | null | undefined;
};

type UseDroppableRouteGroupTargetHighlightParams = {
  isOver: boolean;
  targetRouteGroupId: number | null | undefined;
};

export const useDroppablePlanTargetHighlight = ({
  isOver,
  targetPlanId,
}: UseDroppablePlanTargetHighlightParams) => {
  const { active } = useDndContext();

  return useMemo(() => {
    if (!isOver || targetPlanId == null) return false;

    const source = resolveDraggedOrderOwnership({
      activeData: active?.data.current,
      resolveRouteGroupIdByRouteSolutionId,
      resolvePlanIdByRouteGroupId,
    });

    if (!source) return false;
    return source.planId == null || source.planId !== targetPlanId;
  }, [active?.data, isOver, targetPlanId]);
};

export const useDroppableRouteGroupTargetHighlight = ({
  isOver,
  targetRouteGroupId,
}: UseDroppableRouteGroupTargetHighlightParams) => {
  const { active } = useDndContext();

  return useMemo(() => {
    if (!isOver || targetRouteGroupId == null) return false;

    const source = resolveDraggedOrderOwnership({
      activeData: active?.data.current,
      resolveRouteGroupIdByRouteSolutionId,
      resolvePlanIdByRouteGroupId,
    });

    if (!source) return false;
    return (
      source.routeGroupId == null || source.routeGroupId !== targetRouteGroupId
    );
  }, [active?.data, isOver, targetRouteGroupId]);
};
