import type { ReactNode } from 'react'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarDesktopLayoutProps = {
  calendar: ReactNode
  editor: ReactNode
  windowsPanel: ReactNode
}

export const DeliveryWindowCalendarDesktopLayout = ({
  calendar,
  editor,
  windowsPanel,
}: DeliveryWindowCalendarDesktopLayoutProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { layout } = shellScale

  return (
    <div
      className={`grid min-w-0 ${layout.desktopGapClassName}`}
      style={{ gridTemplateColumns: layout.desktopColumns }}
    >
      <div className={`flex min-w-0 flex-col ${layout.desktopLeftGapClassName}`}>
        {calendar}
        {editor}
      </div>

      <div className={`flex min-w-0 flex-col ${layout.desktopRightGapClassName}`}>
        {windowsPanel}
      </div>
    </div>
  )
}
