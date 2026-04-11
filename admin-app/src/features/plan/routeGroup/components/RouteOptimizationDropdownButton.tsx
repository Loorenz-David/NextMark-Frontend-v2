import { CheckMarkIcon, ThunderIcon } from '@/assets/icons'
import { useMemo, useState } from 'react'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { DropdownButton } from '@/shared/buttons/DropdownButton'

import { useRouteGroupPageCommands, useRouteGroupPageState } from '../context/useRouteGroupPageContext'

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
    previewedSolutionId,
    isLoadingPreview,
  } = useRouteGroupPageState()
  const {
    routeGroupPageActions,
  } = useRouteGroupPageCommands()
  const [pendingPreviewId, setPendingPreviewId] = useState<number | null>(null)

  const primaryLabel = isSelectedSolutionOptimized ? 'Update optimization' : 'Optimize route'
  const previewedIsBackendSelected = useMemo(
    () =>
      previewedSolutionId != null &&
      routeSolutionsOrdered.find((solution) => solution.id === previewedSolutionId)?.is_selected === true,
    [previewedSolutionId, routeSolutionsOrdered],
  )
  const showConfirmSelect = previewedSolutionId != null && !previewedIsBackendSelected

  const handlePreviewRouteSolution = (solutionId: number) => {
    setPendingPreviewId(solutionId)
    routeGroupPageActions.previewRouteSolution(solutionId)
  }

  const resolvedPendingPreviewId =
    isLoadingPreview ? pendingPreviewId : null

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
      onClick={routeGroupPageActions.optimizeRoute}
    >
      <div className="w-full">
        <div className="max-h-[300px] overflow-y-auto scroll-thin">
          {routeSolutionsOrdered.length ? (
            routeSolutionsOrdered.map((solution, index) => {
              const label = solution.label || `variant ${index + 1}`
              const isBackendSelected = solution.is_selected
              const isBest = solution.id === bestRouteSolutionId
              const isPreviewing =
                solution.id != null &&
                previewedSolutionId != null &&
                solution.id === previewedSolutionId
              const isPendingPreview =
                solution.id != null &&
                resolvedPendingPreviewId != null &&
                solution.id === resolvedPendingPreviewId
              return (
                <button
                  key={solution.client_id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] px-3 py-2.5 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoadingPreview}
                  onClick={() => solution.id && handlePreviewRouteSolution(solution.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-left text-sm text-[var(--color-text)]">{label}</span>
                    {isBest ? (
                      <span className="rounded-full border border-[rgba(112,222,208,0.24)] bg-[rgba(72,180,194,0.14)] px-2 py-0.5 text-[10px] text-[rgb(214,255,248)]">
                        Best
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {isPendingPreview ? (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        Loading
                      </span>
                    ) : null}
                    {isPreviewing ? (
                      <span className="rounded-full border border-[rgba(112,222,208,0.24)] bg-[rgba(72,180,194,0.14)] px-2 py-0.5 text-[10px] text-[rgb(214,255,248)]">
                        Preview
                      </span>
                    ) : null}
                    {isBackendSelected ? (
                      <CheckMarkIcon className="h-4 w-4 text-[var(--color-primary)]" />
                    ) : null}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
              No route variants yet.
            </div>
          )}
        </div>

        {showConfirmSelect ? (
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <BasicButton
              params={{
                variant: 'primary',
                onClick: routeGroupPageActions.confirmSelectRouteSolution,
                className: 'w-full',
                disabled: isLoadingPreview,
              }}
            >
              Select this route
            </BasicButton>
          </div>
        ) : null}

        {isSelectedSolutionOptimized ? (
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <BasicButton
              params={{
                variant: 'toolbarSecondary',
                onClick: routeGroupPageActions.reOptimizeRoute,
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
