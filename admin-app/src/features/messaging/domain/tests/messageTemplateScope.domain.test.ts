import { findTemplateForScope, matchesTemplateScope } from '../messageTemplateScope'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const templates = [
  { client_id: 'a', event: 'order_ready', plan_type: 'local_delivery' },
  { client_id: 'b', event: 'order_ready', plan_type: 'store_pickup' },
  { client_id: 'c', event: 'order_created', plan_type: 'store_pickup' },
  { client_id: 'legacy', event: 'order_completed', plan_type: null },
]

assert(
  findTemplateForScope(templates, 'order_ready', 'store_pickup')?.client_id === 'b',
  'picks the template of the requested plan type, not the first event match',
)

assert(
  findTemplateForScope(templates, 'order_ready', 'local_delivery')?.client_id === 'a',
  'picks the local delivery template for the same event',
)

assert(
  findTemplateForScope(templates, 'order_ready', 'international_shipping') === null,
  'returns null when the event has no template for that plan type (no fallback)',
)

assert(
  findTemplateForScope(templates, 'order_completed', 'local_delivery')?.client_id === 'legacy',
  'a template without plan_type is treated as local delivery, matching the backend backfill',
)

assert(
  !matchesTemplateScope(templates[2], 'order_created', 'local_delivery'),
  'event match alone is not enough',
)

console.log('messageTemplateScope domain tests passed')
