import { CheckMarkIcon, ThunderIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { DropdownButton } from '@/shared/buttons/DropdownButton'

import { useLocalDeliveryCommands, useLocalDeliveryState } from '../context/useLocalDeliveryContext'

type Props = {
  className?: string
  borderColor?:string
}

export const RouteOptimizationDropdownButton = ({
  className,
  borderColor,
}: Props) => {
  const {
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
  } = useLocalDeliveryState()
  const {
    localDeliveryActions,
  } = useLocalDeliveryCommands()

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
          <ThunderIcon className="h-5 w-5 text-[rgb(208,255,248)]" />
          <span className="text-sm font-medium text-[rgb(226,255,251)]">{primaryLabel}</span>
        </div>
      }

      variant="secondary"
      style={{
        background:
          'linear-gradient(135deg, rgba(72, 180, 194, 0.18), rgba(111, 224, 207, 0.08))',
        borderColor: 'rgba(112, 222, 208, 0.24)',
        boxShadow: '0 16px 34px rgba(0, 0, 0, 0.18)',
        color: 'rgb(226,255,251)',
      }}
      onClick={localDeliveryActions.optimizeRoute}
    >
      <div className="w-full">
        <div className="max-h-[300px] overflow-y-auto scroll-thin">
          {routeSolutionsOrdered.length ? (
            routeSolutionsOrdered.map((solution, index) => {
              const label = solution.label || `variant ${index + 1}`
              const isSelected = solution.is_selected
              const isBest = solution.id === bestRouteSolutionId
              return (
                <button
                  key={solution.client_id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                  onClick={() => solution.id && localDeliveryActions.selectRouteSolution(solution.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-left text-sm text-[var(--color-text)]">{label}</span>
                    {isBest ? (
                      <span className="rounded-full border border-[rgba(112,222,208,0.24)] bg-[rgba(72,180,194,0.14)] px-2 py-0.5 text-[10px] text-[rgb(214,255,248)]">
                        Best
                      </span>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <CheckMarkIcon className="h-4 w-4 text-[var(--color-primary)]" />
                  ) : null}
                </button>
              )
            })
          ) : (
            <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
              No route variants yet.
            </div>
          )}
        </div>

        {isSelectedSolutionOptimized ? (
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <BasicButton
              params={{
                variant: 'toolbarSecondary',
                onClick: localDeliveryActions.reOptimizeRoute,
                className: 'w-full',
              }}
            >
              Re-optimize
            </BasicButton>
          </div>
        ) : null}
      </div>
    </DropdownButton>
  )
}
