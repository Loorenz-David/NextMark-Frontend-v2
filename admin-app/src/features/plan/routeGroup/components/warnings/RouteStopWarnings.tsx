import { useMemo, useState } from 'react'

import { TriangleWarningIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'
import { formatRouteTime } from '@/features/plan/routeGroup/utils/formatRouteTime'

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
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-warning-border bg-[linear-gradient(135deg,rgba(var(--warning-highlight-r),0.18),rgba(var(--warning-highlight-r),0.08))]"
                    onMouseEnter={() => setWarningOpen(true)}
                    onMouseLeave={() => setWarningOpen(false)}
                >
                    <TriangleWarningIcon className="h-4 w-4 text-warning" />
                </div>
            }
        >
            <div
                className="admin-backdrop-blur-xl w-72 rounded-3xl border border-warning-border bg-[linear-gradient(135deg,rgba(var(--warning-highlight-r),0.18),rgba(var(--warning-highlight-r),0.06))] p-3 text-xs text-warning shadow-[var(--shadow-panel-floating)]"
                onMouseEnter={() => setWarningOpen(true)}
                onMouseLeave={() => setWarningOpen(false)}
            >
                {stop?.reason_was_skipped && (
                    <div className="mb-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-warning">
                            Skipped
                        </div>
                        <div className="mt-1 text-[0.85rem] text-warning">
                            {stop.reason_was_skipped}
                        </div>
                    </div>
                )}
                {(constraintWarnings.length > 0 || stop?.has_constraint_violation) && (
                    <div className="space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-warning">
                            Violation
                        </div>
                        {constraintWarnings.length === 0 && (
                            <div className="rounded-2xl border border-warning-border bg-shade p-2.5 text-[0.85rem] text-warning">
                                Constraint violation detected.
                            </div>
                        )}
                        {constraintWarnings.map((warning, index) => {
                            const payload = warning as ConstraintWarning
                            const meta = buildWarningMeta(payload, planStartDate)
                            return (
                                <div
                                    key={`${payload.type ?? 'warning'}-${index}`}
                                    className="rounded-2xl border border-warning-border bg-shade p-2.5"
                                >
                                    <div className="text-[0.85rem] font-medium text-warning">
                                        {payload.message ?? 'Constraint violation'}
                                    </div>
                                    {meta.length > 0 && (
                                        <div className="mt-2 space-y-1 text-[0.72rem] text-warning">
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
