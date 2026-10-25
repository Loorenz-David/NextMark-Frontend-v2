/** Marks a panel that covers other drop targets; see keepCollisionsInDropSurface. */
export const DROP_SURFACE_ATTRIBUTE = 'data-drop-surface'

type SurfaceNode<TNode> = { contains: (other: TNode) => boolean }

/**
 * Keeps only the collisions inside the drop surface the pointer is over.
 * Droppables stay measured while a surface covers them — the plan list keeps
 * its cards laid out under an open plan panel — so a pointer test alone would
 * let a card the user cannot see take the drop. Membership is by DOM, not by
 * what is painted, so rows a sortable list shifts mid-drag stay valid.
 * Outside any surface (`null`) nothing is filtered.
 */
export const keepCollisionsInDropSurface = <TCollision extends { id: unknown }, TNode>(
  collisions: TCollision[],
  surface: SurfaceNode<TNode> | null,
  resolveNode: (id: TCollision['id']) => TNode | null | undefined,
): TCollision[] => {
  if (!surface) return collisions
  return collisions.filter((collision) => {
    const node = resolveNode(collision.id)
    return node != null && surface.contains(node)
  })
}
