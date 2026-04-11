import type {
  OrderCaseCreateFields,
  OrderCaseState,
} from '@/features/orderCase/types'


const VALID_STATES: OrderCaseState[] = ['Open', 'Resolving', 'Resolved']

export const useOrderCaseValidation = () => {


  const validateCreateCasePayload = (payload: OrderCaseCreateFields) => {
    if (typeof payload.client_id !== 'string' || !payload.client_id.trim()) return false
    if (!Number.isFinite(payload.order_id) || payload.order_id <= 0) return false
    if (payload.state && !VALID_STATES.includes(payload.state)) return false
    return true
  }

  

  return {
    validateCreateCasePayload,
  }
}