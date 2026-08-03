/**
 * Orders responses are not safe to apply wholesale once a second mutation is in
 * flight.
 *
 * A local-delivery move returns the *resequenced* stops of every route it
 * touched, not just the moved order's — so a response can legitimately carry a
 * stop for an order that a later, still-pending move has already taken off that
 * route. Applying it verbatim resurrects the row the user just moved.
 *
 * Every mutation claims the orders it is about and gets a monotonic sequence
 * number back. At commit time a claim can ask whether an order has since been
 * claimed by a newer mutation; if it has, that part of the response is stale and
 * gets dropped. The newer mutation's own response is the one that settles it.
 *
 * Claims are never released: the map records the last mutation to touch each
 * order, which is exactly what the comparison needs. It holds one integer per
 * order moved in the session.
 */

let sequence = 0;
const lastClaimByOrderId = new Map<number, number>();
const pendingCountByOrderId = new Map<number, number>();

const isUsableOrderId = (orderId: unknown): orderId is number =>
  typeof orderId === "number" && Number.isFinite(orderId);

/**
 * Registers a mutation over these orders and returns its sequence number, to be
 * passed back to `isOrderMutationSuperseded` when the response lands.
 *
 * Also marks the orders as in flight until `releaseOrderMutation` runs. Callers
 * must release in a `finally`, or those orders stay frozen against refetches.
 */
export const claimOrderMutation = (
  orderIds: Array<number | null | undefined>,
): number => {
  sequence += 1;
  orderIds.forEach((orderId) => {
    if (!isUsableOrderId(orderId)) return;
    lastClaimByOrderId.set(orderId, sequence);
    pendingCountByOrderId.set(
      orderId,
      (pendingCountByOrderId.get(orderId) ?? 0) + 1,
    );
  });
  return sequence;
};

/** Clears the in-flight mark; the claim's sequence number is kept for ordering. */
export const releaseOrderMutation = (
  orderIds: Array<number | null | undefined>,
) => {
  orderIds.forEach((orderId) => {
    if (!isUsableOrderId(orderId)) return;
    const currentCount = pendingCountByOrderId.get(orderId) ?? 0;
    if (currentCount <= 1) {
      pendingCountByOrderId.delete(orderId);
      return;
    }
    pendingCountByOrderId.set(orderId, currentCount - 1);
  });
};

/**
 * True while a mutation for this order is unresolved.
 *
 * Unlike `isOrderMutationSuperseded` — which compares one response against one
 * claim — this guards *authoritative refetches*. A move marks the plan's
 * overview stale, so finishing one move refetches the whole route and replaces
 * its stops with a server snapshot taken before a second, still-pending move was
 * applied. Orders in flight must survive that replace with their local state.
 */
export const hasPendingOrderMutation = (
  orderId: number | null | undefined,
): boolean => {
  if (!isUsableOrderId(orderId)) return false;
  return (pendingCountByOrderId.get(orderId) ?? 0) > 0;
};

/**
 * True when a mutation newer than `claim` has taken ownership of this order, so
 * anything `claim`'s response says about it is already out of date.
 */
export const isOrderMutationSuperseded = (
  orderId: number | null | undefined,
  claim: number,
): boolean => {
  if (!isUsableOrderId(orderId)) return false;
  return (lastClaimByOrderId.get(orderId) ?? 0) > claim;
};

/** Test-only: drops all claims so cases start from a clean sequence. */
export const resetOrderMutationSequence = () => {
  sequence = 0;
  lastClaimByOrderId.clear();
  pendingCountByOrderId.clear();
};
