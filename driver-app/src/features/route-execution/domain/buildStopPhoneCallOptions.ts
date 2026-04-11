import type { Phone } from '@shared-domain'
import type { AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import type { PhoneCallOption } from '@/app/services/phoneCall.service'

function sanitizeDialValue(phone: Phone | null | undefined) {
  if (!phone) {
    return null
  }

  const prefix = phone.prefix.trim()
  const number = phone.number.replace(/[^\d]/g, '').trim()
  if (!prefix && !number) {
    return null
  }

  const dialValue = `${prefix}${number}`.replace(/(?!^\+)[^\d]/g, '')
  return dialValue || null
}

function buildDisplayValue(phone: Phone | null | undefined) {
  if (!phone) {
    return null
  }

  const prefix = phone.prefix.trim()
  const number = phone.number.trim()
  if (!prefix && !number) {
    return null
  }

  return `${prefix}${number}`.trim()
}

function buildOption(
  id: PhoneCallOption['id'],
  label: PhoneCallOption['label'],
  phone: Phone | null | undefined,
): PhoneCallOption | null {
  const dialValue = sanitizeDialValue(phone)
  const displayValue = buildDisplayValue(phone)
  if (!dialValue || !displayValue) {
    return null
  }

  return {
    id,
    label,
    displayValue,
    dialValue,
  }
}

export function buildStopPhoneCallOptions(stop: AssignedStopViewModel | null): PhoneCallOption[] {
  if (!stop?.order) {
    return []
  }

  return [
    buildOption('primary', 'Primary phone', stop.order.client_primary_phone),
    buildOption('secondary', 'Secondary phone', stop.order.client_secondary_phone),
  ].filter((option): option is PhoneCallOption => Boolean(option))
}
