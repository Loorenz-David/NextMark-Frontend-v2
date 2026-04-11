import type { Phone } from '@/types/phone'

export type SendClientFormLinkPopupPayload = {
  orderId: number
  hasGeneratedLink: boolean
  initialEmail?: string | null
  initialPhone?: Phone | null
  formUrl?: string | null
  expiresAt?: string | null
}

export type SendClientFormLinkFormState = {
  email: string
  phone: Phone
}
