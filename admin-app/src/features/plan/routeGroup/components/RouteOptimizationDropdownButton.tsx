import { ThunderIcon } from '@/assets/icons'
import { DropdownButton } from '@/shared/buttons/DropdownButton'

import { useRouteGroupPageCommands, useRouteGroupPageState } from '../context/useRouteGroupPageContext'
import { RouteSolutionVariantList } from './RouteSolutionVariantList'

type Props = {
  className?: string
  borderColor?:string
}

export const RouteOptimizationDropdownButton = ({
  className,
  borderColor,
}: Props) => {
  const { isSelectedSolutionOptimized } = useRouteGroupPageState()
  const {
    routeGroupPageActions,
  } = useRouteGroupPageCommands()

  const primaryLabel = isSelectedSolutionOptimized ? 'Update optimization' : 'Optimize route'

  return (
    <DropdownButton
      className={className}
      borderColor={borderColor}
      fullWidth
      floatingClassName="z-[220]"
      renderInPortal={true}
      label={
        <div className="flex w-full items-center justify-center gap-3 py-1.5">
          <ThunderIcon className="h-5 w-5 text-[var(--optimize-ink)]" />
          <span className="text-sm font-medium text-[var(--optimize-ink)]">{primaryLabel}</span>
        </div>
      }

      variant="secondary"
      style={{
        background:
          'linear-gradient(135deg, rgba(var(--optimize-r),0.18), rgba(var(--optimize-r),0.08))',
        borderColor: 'rgba(var(--optimize-r),0.24)',
        boxShadow: 'var(--shadow-button-route)',
        color: 'var(--optimize-ink)',
      }}
      onClick={routeGroupPageActions.optimizeRoute}
    >
      <RouteSolutionVariantList />
    </DropdownButton>
  )
}
