import type { DesktopPlanViewMode } from '@/features/home-route-operations/hooks/useHomeDesktopLayout'
import { PlanCalendarPage } from '../calendar/pages/PlanCalendar.page'
import { usePlanCalendarStore } from '../calendar/store/planCalendar.store'
import { RoutePlanPage } from '../pages/Plan.page'
import { PlanDesktopTimeline } from './PlanDesktopTimeline'

type PlanDesktopShellProps = {
  viewMode?: DesktopPlanViewMode
}

export const PlanDesktopShell = ({ viewMode = 'rail' }: PlanDesktopShellProps) => {
  const containerView = usePlanCalendarStore((state) => state.containerView)

  if (viewMode === 'split') {
    return (
      <PlanDesktopTimeline/>
    )
  }

  if (containerView === 'list') {
    return (
      <RoutePlanPage showViewSwitch />
    )
  }

  return <PlanCalendarPage />
}
