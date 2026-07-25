import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

import type { OrderFormState } from '../state/OrderForm.types'

const text = (value: string | null | undefined) => (value ?? '').trim()

const emailKey = (value: string | null | undefined) => text(value).toLowerCase()

const phoneKey = (phone: Phone | null | undefined) =>
  phone && text(phone.number)
    ? `${text(phone.prefix)}|${text(phone.number)}`
    : ''

const addressKey = (value: address | null | undefined) =>
  value
    ? [
        text(value.street_address),
        text(value.city),
        text(value.postal_code),
        text(value.country),
      ].join('|')
    : ''

/**
 * True when the order's customer-identity fields were edited away from the
 * initially-loaded order — i.e. there is a customer change to push back.
 * Coordinates are ignored so float precision never counts as a difference.
 */
export const orderFormCostumerFieldsChanged = (
  current: OrderFormState,
  initial: OrderFormState,
): boolean =>
  text(current.client_first_name) !== text(initial.client_first_name) ||
  text(current.client_last_name) !== text(initial.client_last_name) ||
  emailKey(current.client_email) !== emailKey(initial.client_email) ||
  phoneKey(current.client_primary_phone) !==
    phoneKey(initial.client_primary_phone) ||
  phoneKey(current.client_secondary_phone) !==
    phoneKey(initial.client_secondary_phone) ||
  addressKey(current.client_address) !== addressKey(initial.client_address)
