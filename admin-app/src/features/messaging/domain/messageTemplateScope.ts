import { normalizePlanType, type RoutePlanObjective } from '@/features/plan'

/**
 * A message template is scoped by the business event it reacts to and the
 * plan type of the order it is sent for. The store holds every plan type's
 * template side by side, so lookups must match on both.
 */
export type MessageTemplateScopeFields = {
  event: string
  plan_type?: string | null
}

export const matchesTemplateScope = (
  template: MessageTemplateScopeFields,
  eventKey: string,
  planType: RoutePlanObjective,
): boolean => template.event === eventKey && normalizePlanType(template.plan_type) === planType

export const findTemplateForScope = <T extends MessageTemplateScopeFields>(
  templates: readonly T[],
  eventKey: string,
  planType: RoutePlanObjective,
): T | null => templates.find((template) => matchesTemplateScope(template, eventKey, planType)) ?? null
