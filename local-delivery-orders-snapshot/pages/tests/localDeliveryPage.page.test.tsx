import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'

import { LocalDeliveryProvider } from '../../context/LocalDelivery.provider'
import { RouteGroupsPage, LocalDeliveryPageLayout } from '../LocalDelivery.page'
import { LocalDeliveryPageContent } from '../LocalDeliveryPageContent.page'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runLocalDeliveryPageTests = () => {
  assert(
    RouteGroupsPage({ payload: {} }) === null,
    'page should return null when planId is missing',
  )

  const pageElement = RouteGroupsPage({ payload: { planId: 42 } })
  if (!isValidElement<{ planId: number; children?: ReactNode }>(pageElement)) {
    throw new Error('page should return a provider tree when planId is present')
  }
  assert(
    pageElement.type === LocalDeliveryProvider,
    'page should keep LocalDeliveryProvider at the page level',
  )
  assert(pageElement.props.planId === 42, 'page should forward planId to the provider')

  const layoutElement = pageElement.props.children
  if (!isValidElement<{ routeGroups?: unknown[]; children?: ReactNode }>(layoutElement)) {
    throw new Error('page should render the page layout inside the provider')
  }
  assert(
    layoutElement.type === LocalDeliveryPageLayout,
    'page should compose the page layout inside the provider',
  )
  assert(
    Array.isArray(layoutElement.props.routeGroups) && layoutElement.props.routeGroups.length > 0,
    'page should pass temporary route groups into the rail layout',
  )

  const layoutTree = LocalDeliveryPageLayout({
    routeGroups: [{ route_group_id: 1, label: 'Route 1' }],
    onRouteGroupClick: () => undefined,
  })

  if (!isValidElement<{ className?: string; children?: ReactNode }>(layoutTree)) {
    throw new Error('layout should return a valid React element')
  }
  assert(
    String(layoutTree.props.className).includes('md:flex-row'),
    'layout should switch to two columns on medium screens',
  )

  const layoutChildren = Children.toArray(layoutTree.props.children)
  assert(layoutChildren.length === 2, 'layout should render two top-level columns')

  const contentColumn = layoutChildren[1]
  if (!isValidElement<{ children?: ReactNode }>(contentColumn)) {
    throw new Error('layout should include a content column')
  }

  const contentChild = contentColumn.props.children
  if (!isValidElement(contentChild)) {
    throw new Error('content column should render a page content element')
  }
  assert(
    contentChild.type === LocalDeliveryPageContent,
    'layout should keep LocalDeliveryPageContent in the second column',
  )
}
