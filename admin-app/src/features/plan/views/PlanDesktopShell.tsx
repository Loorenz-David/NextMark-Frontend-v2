import type { DesktopPlanViewMode } from '@/features/home-route-operations/hooks/useHomeDesktopLayout'
import { PlanCalendarPage } from '../calendar/pages/PlanCalendar.page'
import { PlanContainerViewToggle } from '../calendar/components/PlanContainerViewToggle'
import { usePlanCalendarStore } from '../calendar/store/planCalendar.store'
import { RoutePlanPage } from '../pages/Plan.page'
import { PlanDesktopTimeline } from './PlanDesktopTimeline'

type PlanDesktopShellProps = {
  onRequestClose?: () => void
  showCloseButton?: boolean
  className?: string
  viewMode?: DesktopPlanViewMode
}

export const PlanDesktopShell = ({
  onRequestClose,
  viewMode = 'rail',
}: PlanDesktopShellProps) => {
  const containerView = usePlanCalendarStore((state) => state.containerView)

  if (viewMode === 'split') {
    return (
      <PlanDesktopTimeline/>
    )
  }

  if (containerView === 'list') {
    return (
      <RoutePlanPage
        onRequestClose={onRequestClose}
        showCloseButton
        headerAccessory={<PlanContainerViewToggle />}
      />
    )
  }

  return <PlanCalendarPage />
}
