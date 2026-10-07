/**
 * Whether the route-operations drag in flight moves the whole order selection.
 *
 * The DnD controller decides this once, at drag start, and publishes it as the
 * active drag's `type`. Reading that decision — instead of re-deriving it from
 * the selection store — keeps "what the list hides" identical to "what the
 * drop moves". The value arrives untyped through the resource manager, so it
 * is narrowed here rather than cast.
 */
export const isOrderBatchActiveDrag = (activeDrag: unknown): boolean =>
  typeof activeDrag === 'object' &&
  activeDrag !== null &&
  'type' in activeDrag &&
  activeDrag.type === 'order_batch'
