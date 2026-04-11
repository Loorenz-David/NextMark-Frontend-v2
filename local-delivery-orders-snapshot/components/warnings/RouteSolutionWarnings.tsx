import { useEffect, useMemo, useRef, useState } from 'react'

import { TriangleWarningIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import type { RouteSolutionWarning } from '@/features/local-delivery-orders/types/routeSolution'
import type { RouteSolutionWarningRegistry } from '@/features/local-delivery-orders/domain/routeSolutionWarningRegistry'
import type { useLocalDeliveryActions } from '@/features/local-delivery-orders/actions/useLocalDeliveryActions'

type RouteSolutionWarningsProps = {
  warnings?: RouteSolutionWarning[] | null
  planStartDate?: string | null
  registry: RouteSolutionWarningRegistry
  localDeliveryActions: ReturnType<typeof useLocalDeliveryActions>
}

export const RouteSolutionWarnings = ({
  warnings,
  planStartDate,
  registry,
  localDeliveryActions,
}: RouteSolutionWarningsProps) => {
  const [warningOpen, setWarningOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredWarnings = useMemo(
    () =>
      (Array.isArray(warnings) ? warnings : []).filter((warning) =>
        registry.isRegistered(warning?.type),
      ),
    [registry, warnings],
  )
  const resolvableWarnings = useMemo(
    () => registry.getResolvableWarnings(filteredWarnings),
    [filteredWarnings, registry],
  )

  const handleResolve = async () => {
    if (isResolving || resolvableWarnings.length === 0) return
    setIsResolving(true)
    try {
      await localDeliveryActions.resolveRouteWarnings(resolvableWarnings)
    } finally {
      setIsResolving(false)
    }
  }

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setWarningOpen(true)
  }

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = setTimeout(() => {
      setWarningOpen(false)
      closeTimerRef.current = null
    }, 180)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  if (filteredWarnings.length === 0) return null

  return (
    <FloatingPopover
      open={warningOpen}
      onOpenChange={setWarningOpen}
      classes="flex-none"
      offSetNum={6}
      renderInPortal={true}
      floatingClassName="z-[220]"
      reference={
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.08))]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <TriangleWarningIcon className="h-4 w-4 text-amber-300" />
        </div>
      }
    >
      <div
        className="w-72 rounded-[20px] border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.06))] p-3 text-xs text-amber-50 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              Route warning
            </div>
            {resolvableWarnings.length > 0 && (
              <button
                type="button"
                className="rounded-full border border-amber-300/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-100/90 transition-colors hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleResolve}
                disabled={isResolving}
              >
                {isResolving ? 'Resolving...' : 'Resolve'}
              </button>
            )}
          </div>
          {filteredWarnings.map((warning, index) => {
            const message = registry.getMessage(warning)
            const meta = registry.getDisplayMeta(warning, planStartDate)
            return (
              <div
                key={`${warning.type ?? 'warning'}-${index}`}
                className="rounded-[16px] border border-amber-200/15 bg-black/10 p-2.5"
              >
                <div className="text-[0.85rem] font-medium text-amber-50/95">
                  {message}
                </div>
                {meta.length > 0 && (
                  <div className="mt-2 space-y-1 text-[0.72rem] text-amber-100/70">
                    {meta.map((item) => (
                      <div key={item.label} className="flex w-full justify-between">
                        <span>{item.label}:</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </FloatingPopover>
  )
}
