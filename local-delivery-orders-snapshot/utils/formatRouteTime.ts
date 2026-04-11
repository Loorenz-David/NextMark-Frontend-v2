import { formatIsoToTeamTimeZone } from '@/shared/utils/teamTimeZone'

export const formatRouteTime = (
  value?: string | null,
  planStartDateOrForceDate?: string | 'today' | boolean | null,
  forceDateOrFallback?: boolean | string,
  fallback: string = '--',
) => {
  if (!value) return fallback

  const forceDate = typeof forceDateOrFallback === 'boolean'
    ? forceDateOrFallback
    : typeof planStartDateOrForceDate === 'boolean'
      ? planStartDateOrForceDate
      : false

  const resolvedFallback = typeof forceDateOrFallback === 'string'
    ? forceDateOrFallback
    : fallback

  const teamIso = formatIsoToTeamTimeZone(value)
  if (!teamIso) return resolvedFallback

  const parsed = new Date(teamIso)
  if (Number.isNaN(parsed.getTime())) return value

  const planStartDate =
    typeof planStartDateOrForceDate === 'string' || planStartDateOrForceDate === null
      ? planStartDateOrForceDate
      : null

  const timePart = teamIso.slice(11, 16)

  if (!planStartDate) return timePart

  let planDate = new Date() 
  if(planStartDate !== 'today'){
    planDate = new Date(planStartDate)
  }

  if (Number.isNaN(planDate.getTime())) return timePart

  const sameDay =
    parsed.getFullYear() === planDate.getFullYear() &&
    parsed.getMonth() === planDate.getMonth() &&
    parsed.getDate() === planDate.getDate()
  
  if(sameDay && (planStartDate === 'today' || forceDate)){
    return `Today - ${timePart}`
  }
  
  if (sameDay) return timePart

  const datePart = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return `${datePart} - ${timePart}`
}
