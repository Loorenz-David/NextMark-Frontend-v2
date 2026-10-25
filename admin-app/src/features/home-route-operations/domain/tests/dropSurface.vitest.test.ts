import { describe, expect, it } from 'vitest'

import { keepCollisionsInDropSurface } from '../dropSurface'

type FakeNode = { name: string; parent: FakeNode | null }

const node = (name: string, parent: FakeNode | null = null): FakeNode => ({ name, parent })
const surfaceOf = (root: FakeNode) => ({
  contains: (other: FakeNode) => {
    for (let current: FakeNode | null = other; current; current = current.parent) {
      if (current === root) return true
    }
    return false
  },
})

describe('keepCollisionsInDropSurface', () => {
  const panel = node('plan panel')
  const list = node('stop list', panel)
  const nodes: Record<string, FakeNode> = {
    stopA: node('stop A', list),
    stopB: node('stop B', list),
    hiddenPlan: node('plan card under the panel'),
  }
  const resolveNode = (id: string) => nodes[id]

  it('drops targets outside the panel the pointer is over', () => {
    const collisions = [{ id: 'hiddenPlan' }, { id: 'stopB' }]
    expect(keepCollisionsInDropSurface(collisions, surfaceOf(panel), resolveNode)).toEqual([
      { id: 'stopB' },
    ])
  })

  it('keeps every target inside the panel, wherever a drag has shifted it', () => {
    const collisions = [{ id: 'stopA' }, { id: 'stopB' }]
    expect(keepCollisionsInDropSurface(collisions, surfaceOf(panel), resolveNode)).toEqual(
      collisions,
    )
  })

  it('drops a target whose node is gone', () => {
    expect(keepCollisionsInDropSurface([{ id: 'missing' }], surfaceOf(panel), resolveNode)).toEqual(
      [],
    )
  })

  it('filters nothing when the pointer is over no surface', () => {
    const collisions = [{ id: 'hiddenPlan' }, { id: 'stopB' }]
    expect(keepCollisionsInDropSurface(collisions, null, resolveNode)).toEqual(collisions)
  })
})
