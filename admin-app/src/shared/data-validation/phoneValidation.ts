import type { Phone } from '@/types/phone'
import { EMPTY_VALUE } from '@/shared/layout/LabelValue'
import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'

export const isPhone = (v: unknown): v is Phone =>
  typeof v === 'object' && v !== null && 'number' in v

export const formatPhone = (value?: Phone | string | null) => {
  if (!value) return EMPTY_VALUE
  if (typeof value === 'string') return value

  if (isPhone(value)) {
    return value.prefix
      ? value.prefix + value.number
      : value.number
  }

  return EMPTY_VALUE
}


export const normalizePhone = (value: Record<string, unknown> | null | undefined): Phone => {
    if (
        value &&
        typeof value === 'object' &&
        'prefix' in value &&
        'number' in value
    ) {
        return value as Phone
    }

    return {
        prefix: DEFAULT_PREFIX,
        number: '',
    }
}