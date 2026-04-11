import { Children, createElement, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { LocalDeliveryRouteGroupAvatar } from '../LocalDeliveryRouteGroupAvatar'
import { LocalDeliveryRouteGroupRail } from '../LocalDeliveryRouteGroupRail'
import type { LocalDeliveryRouteGroupItem } from '../types'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const ITEMS: LocalDeliveryRouteGroupItem[] = [
  { route_group_id: 11, label: 'North' },
  { route_group_id: 12, label: 'South' },
  { route_group_id: 13, label: 'West' },
]

export const runLocalDeliveryRouteGroupRailComponentTests = () => {
  const markup = renderToStaticMarkup(
    createElement(LocalDeliveryRouteGroupRail, {
      items: ITEMS,
      onClick: () => undefined,
    }),
  )

  ITEMS.forEach((item) => {
    assert(markup.includes(item.label), `rail markup should include label ${item.label}`)
  })

  assert(
    markup.split('aria-hidden="true"').length - 1 === ITEMS.length,
    'rail should render one circular avatar element per item',
  )

  let clickedRouteGroupId: number | null = null
  const avatarElement = LocalDeliveryRouteGroupAvatar({
    item: ITEMS[1],
    onClick: (item) => {
      clickedRouteGroupId = item.route_group_id
    },
  })

  if (!isValidElement<{ onClick: () => void }>(avatarElement)) {
    throw new Error('avatar should return a valid React element')
  }
  assert(
    typeof avatarElement.props.onClick === 'function',
    'avatar should expose a clickable button handler',
  )

  avatarElement.props.onClick()

  assert(
    clickedRouteGroupId === ITEMS[1].route_group_id,
    'avatar click should forward the clicked item',
  )

  const railElement = LocalDeliveryRouteGroupRail({
    items: ITEMS,
    onClick: () => undefined,
  })

  if (!isValidElement<{ className?: string; children?: ReactNode }>(railElement)) {
    throw new Error('rail should return a valid React element')
  }
  assert(
    String(railElement.props.className).includes('md:w-[100px]'),
    'rail should keep the fixed 100px desktop width',
  )

  const railChildren = Children.toArray(railElement.props.children)
  const listContainer = railChildren[0]

  if (!isValidElement<{ children?: ReactNode }>(listContainer)) {
    throw new Error('rail should wrap avatars in a list container')
  }

  const avatarChildren = Children.toArray(listContainer.props.children)
  assert(
    avatarChildren.length === ITEMS.length,
    'rail should render one avatar entry per input item',
  )
}
