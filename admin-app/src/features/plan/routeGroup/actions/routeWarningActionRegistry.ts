import type { DeliveryPlan } from '@/features/plan/types/plan'
import type {
  RouteEndTimeExceededWarning,
  RouteSolution,
  RouteSolutionWarning,
} from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteGroupEditFormState } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.types'
import { buildFormState } from '@/features/plan/routeGroup/forms/routeGroupEditForm/routeGroupEditForm.bootstrap'
import { ROUTE_SOLUTION_WARNING_TYPES } from '@/features/plan/routeGroup/domain/routeSolutionWarningRegistry'

type UpdateRouteGroupSettings = (
  formState: RouteGroupEditFormState,
) => Promise<object | null>

export type ResolveContext = {
  routeGroupId?: number | null
  plan?: DeliveryPlan | null
  selectedRouteSolution?: RouteSolution | null
  updateRouteGroupSettings: UpdateRouteGroupSettings
}

export type RouteWarningActionHandler = (
  warning: RouteSolutionWarning,
  ctx: ResolveContext,
) => Promise<boolean>

export type RouteWarningActionRegistry = Record<string, RouteWarningActionHandler>

export const createRouteWarningActionRegistry = (): RouteWarningActionRegistry => ({
  [ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED]: resolveRouteEndTimeExceeded,
})

const resolveRouteEndTimeExceeded: RouteWarningActionHandler = async (
  warning,
  ctx,
) => {
  if (!ctx.routeGroupId || !ctx.plan || !ctx.selectedRouteSolution) return false
  if (!isRouteEndTimeExceededWarning(warning)) return false
  if (typeof warning.route_expected_end !== 'string') return false

  const patchedEndDate = toUtcDayEndIso(warning.route_expected_end)
  if (!patchedEndDate) return false

  const currentFormState = buildFormState(
    ctx.routeGroupId,
    ctx.plan,
    ctx.selectedRouteSolution,
    false,
  )
  const nextFormState: RouteGroupEditFormState = {
    ...currentFormState,
    delivery_plan: {
      ...currentFormState.delivery_plan,
      end_date: patchedEndDate,
    },
  }

  const outcome = await ctx.updateRouteGroupSettings(nextFormState)
  return Boolean(outcome)
}

const isRouteEndTimeExceededWarning = (
  warning: RouteSolutionWarning,
): warning is RouteEndTimeExceededWarning =>
  warning.type === ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED

const toUtcDayEndIso = (value: string): string | null => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      23,
      59,
      59,
      0,
    ),
  ).toISOString()
}
