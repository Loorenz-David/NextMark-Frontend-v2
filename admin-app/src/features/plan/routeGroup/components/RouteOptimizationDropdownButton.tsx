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
          <ThunderIcon className="h-5 w-5 text-[var(--accent-ink)]" />
          <span className="text-sm font-medium text-[var(--accent-ink)]">{primaryLabel}</span>
        </div>
      }

      variant="secondary"
      style={{
        background:
          'linear-gradient(135deg, rgba(var(--accent-r),0.18), rgba(var(--accent-r),0.08))',
        borderColor: 'rgba(var(--accent-r),0.24)',
        boxShadow: 'var(--shadow-button-route)',
        color: 'var(--accent-ink)',
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
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoadingPreview}
                  onClick={() => solution.id && handlePreviewRouteSolution(solution.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-left text-sm text-[var(--color-text)]">{label}</span>
                    {isBest ? (
                      <span className="rounded-full border border-[rgba(var(--accent-r),0.24)] bg-[rgba(var(--accent-r),0.14)] px-2 py-0.5 text-[10px] text-[var(--accent-ink)]">
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
                      <span className="rounded-full border border-[rgba(var(--accent-r),0.24)] bg-[rgba(var(--accent-r),0.14)] px-2 py-0.5 text-[10px] text-[var(--accent-ink)]">
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
