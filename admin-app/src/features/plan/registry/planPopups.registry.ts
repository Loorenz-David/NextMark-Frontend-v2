import { PlanForm } from "../popups/PlanForm"
import { CreateRouteGroupForm } from "../routeGroup/popups/createRouteGroup/CreateRouteGroupForm"
import { RouteGroupEditForm } from "../routeGroup/popups/editRouteGroup/RouteGroupEditForm"
import { OrderAssignmentContactWarningPopup } from "../popups/OrderAssignmentContactWarning/OrderAssignmentContactWarningPopup"
import { PlanObjectiveMismatchPopup } from "../popups/PlanObjectiveMismatch/PlanObjectiveMismatchPopup"


export const planPopupRegistry = {
  PlanForm: PlanForm,
  CreateRouteGroupForm: CreateRouteGroupForm,
  RouteGroupEditForm: RouteGroupEditForm,
  "plan.order-assignment-contact-warning": OrderAssignmentContactWarningPopup,
  "plan.order-objective-mismatch": PlanObjectiveMismatchPopup,
}
