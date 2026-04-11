import { useMemo, useState } from 'react'

import { TriangleWarningIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'
import { formatRouteTime } from '@/features/local-delivery-orders/utils/formatRouteTime'

type RouteStopWarningsProps = {
    stop?: RouteSolutionStop | null
    planStartDate?: string | null
}

export const RouteStopWarnings = ({ stop, planStartDate }: RouteStopWarningsProps) => {
    const [warningOpen, setWarningOpen] = useState(false)
    const constraintWarnings = useMemo(
        () => (Array.isArray(stop?.constraint_warnings) ? stop?.constraint_warnings ?? [] : []),
        [stop?.constraint_warnings],
    )
    const hasWarnings =
        Boolean(stop?.reason_was_skipped) ||
        constraintWarnings.length > 0 ||
        Boolean(stop?.has_constraint_violation)

    if (!hasWarnings) return null

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
                    onMouseEnter={() => setWarningOpen(true)}
                    onMouseLeave={() => setWarningOpen(false)}
                >
                    <TriangleWarningIcon className="h-4 w-4 text-amber-300" />
                </div>
            }
        >
            <div
                className="w-72 rounded-[20px] border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.06))] p-3 text-xs text-amber-50 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl"
                onMouseEnter={() => setWarningOpen(true)}
                onMouseLeave={() => setWarningOpen(false)}
            >
                {stop?.reason_was_skipped && (
                    <div className="mb-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                            Skipped
                        </div>
                        <div className="mt-1 text-[0.85rem] text-amber-50/95">
                            {stop.reason_was_skipped}
                        </div>
                    </div>
                )}
                {(constraintWarnings.length > 0 || stop?.has_constraint_violation) && (
                    <div className="space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                            Violation
                        </div>
                        {constraintWarnings.length === 0 && (
                            <div className="rounded-[16px] border border-amber-200/15 bg-black/10 p-2.5 text-[0.85rem] text-amber-50/95">
                                Constraint violation detected.
                            </div>
                        )}
                        {constraintWarnings.map((warning, index) => {
                            const payload = warning as ConstraintWarning
                            const meta = buildWarningMeta(payload, planStartDate)
                            return (
                                <div
                                    key={`${payload.type ?? 'warning'}-${index}`}
                                    className="rounded-[16px] border border-amber-200/15 bg-black/10 p-2.5"
                                >
                                    <div className="text-[0.85rem] font-medium text-amber-50/95">
                                        {payload.message ?? 'Constraint violation'}
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
                )}
            </div>
        </FloatingPopover>
    )
}

type ConstraintWarning = {
    type?: string
    severity?: string
    message?: string
    expected_time?: string
    allowed_start?: string
    allowed_end?: string
    slack_minutes?: number
    route_expected_end?: string
    route_allowed_end?: string
}

const buildWarningMeta = (warning: ConstraintWarning, planStartDate?: string | null) => {
    const meta: Array<{ label: string; value: string }> = []
    if (warning.expected_time) {
        meta.push({
            label: 'Expected arrival time',
            value: formatRouteTime(warning.expected_time, planStartDate, true),
        })
    }
    if (warning.allowed_start) {
        meta.push({
            label: 'Allowed start',
            value: formatRouteTime(warning.allowed_start, planStartDate, true),
        })
    }
    if (warning.allowed_end) {
        meta.push({
            label: 'Allowed end',
            value: formatRouteTime(warning.allowed_end, planStartDate, true),
        })
    }
    if (typeof warning.slack_minutes === 'number') {
        meta.push({ label: 'Slack (min)', value: warning.slack_minutes.toString() })
    }
    if (warning.route_expected_end) {
        meta.push({
            label: 'Route expected end',
            value: formatRouteTime(warning.route_expected_end, planStartDate,  true),
        })
    }
    if (warning.route_allowed_end) {
        meta.push({
            label: 'Route allowed end',
            value: formatRouteTime(warning.route_allowed_end, planStartDate, true),
        })
    }
    return meta
}
