import { useDroppable } from '@dnd-kit/core'

import { useResourceManager } from '@/shared/resource-manager/useResourceManager'
import { useDroppablePlanTargetHighlight } from '@/features/plan/dnd/controllers/useDroppableTargetHighlight.controller'

import { PlanCard } from './PlanCard'
import type { DeliveryPlan } from '../../types/plan'

type PropsPlanCard = {
    plan: DeliveryPlan;
}
export const DroppablePlanCard = ({ plan }: PropsPlanCard) => {
     const { setNodeRef, isOver } = useDroppable({
        id: `plan-${plan.client_id}`,
        data:{
            label:plan.label,
            type:'plan',
            id:plan.client_id
        }

    })
    const shouldHighlightDropTarget = useDroppablePlanTargetHighlight({
      isOver,
      targetPlanId: plan.id ?? null,
    })
    const { planDropFeedback } = useResourceManager()
    const planFeedback = planDropFeedback && planDropFeedback.planClientId === plan.client_id
      ? planDropFeedback
      : null

    return(
        <div
            ref={setNodeRef}
        >
            <PlanCard
              plan={plan}
              isOver={shouldHighlightDropTarget}
              dropFeedback={planFeedback}
            />
        </div>
    )
}
