import { isOrderBatchActiveDrag } from '../orderBatchDrag.domain'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOrderBatchDragDomainTests = () => {
  assert(
    isOrderBatchActiveDrag({ type: 'order_batch', selectedCount: 3, isLoading: false }),
    'a batch drag should be recognised',
  )
  assert(
    !isOrderBatchActiveDrag({ type: 'order', order: { client_id: 'a' } }),
    'a single-order drag is not a batch drag',
  )
  assert(
    !isOrderBatchActiveDrag({ type: 'order_group', count: 2 }),
    'an address-group drag is not a batch drag',
  )
  assert(!isOrderBatchActiveDrag(null), 'no active drag is not a batch drag')
  assert(!isOrderBatchActiveDrag(undefined), 'a missing provider is not a batch drag')
  assert(!isOrderBatchActiveDrag('order_batch'), 'a bare string is not an active drag')
}
