import { useOrderCaseRules } from "./orderCase.rules"
import type { CaseChatCreateFields, OrderCaseState } from "../types"


export const useCaseDetailsValidation = ()=>{
    const { isStateTransitionAllowed } = useOrderCaseRules()


    const validateStateTransition = (from: OrderCaseState, to: OrderCaseState) =>
        isStateTransitionAllowed(from, to)


    const validateChatMessage = (payload: CaseChatCreateFields) => {
        if (!Number.isFinite(payload.order_case_id) || payload.order_case_id <= 0) return false
        if (typeof payload.message !== 'string') return false
        return payload.message.trim().length > 0
      }

    return {
        validateStateTransition,
        validateChatMessage
    }
}