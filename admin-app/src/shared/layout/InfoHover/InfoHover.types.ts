import type { Placement } from '@floating-ui/react'
import type { ReactNode } from 'react'

export type InfoHoverMessage = {
  title?: ReactNode
  content: ReactNode
}

export type InfoHoverProps = {
  content: InfoHoverMessage | InfoHoverMessage[]
  triggerVariant?: 'icon' | 'text'
  triggerText?: string
  triggerClassName?: string
  overlayClassName?: string
  iconClassName?: string
  renderInPortal?: boolean
  placement?: Placement
  offset?: number
  interactive?: boolean
}

