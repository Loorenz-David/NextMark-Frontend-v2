import type { ReactNode } from 'react'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarMobileLayoutProps = {
  calendar: ReactNode
  windowsPanel: ReactNode
  editor: ReactNode
}

export const DeliveryWindowCalendarMobileLayout = ({
  calendar,
  windowsPanel,
  editor,
}: DeliveryWindowCalendarMobileLayoutProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()

  return (
    <div className={`flex min-w-0 flex-col ${shellScale.layout.mobileGapClassName}`}>
      {calendar}
      {windowsPanel}
      {editor}
    </div>
  )
}
