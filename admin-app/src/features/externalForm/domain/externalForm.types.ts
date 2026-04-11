import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

export type ExternalFormData = {
  client_first_name: string
  client_last_name: string
  client_primary_phone: Phone | null
  client_secondary_phone: Phone | null
  client_email: string
  client_address: address | null
}

export type ExternalFormStep = 'client_info' | 'contact_info' | 'delivery_address'
