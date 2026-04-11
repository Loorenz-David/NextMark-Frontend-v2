
import type {DeliveryPlan} from '../types/plan';
import { PlanCard } from './cards/PlanCard';
import { DroppablePlanCard } from './cards/DroppablePlanCard';
type PropsPlanList = {
    plans: DeliveryPlan[];
    droppable?: boolean
}
export const PlanList = ({plans, droppable}: PropsPlanList) => {
    return ( 
       
        <div className="flex flex-col px-5 gap-4 pb-10">
            {plans.map(plan => (
                droppable ? 
                    <DroppablePlanCard key={plan.client_id} plan={plan} />
                :
                    <PlanCard key={plan.client_id} plan={plan} />

            ))}
        </div>

    );
}
