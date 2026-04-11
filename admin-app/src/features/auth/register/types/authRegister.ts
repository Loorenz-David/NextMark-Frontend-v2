import type { Phone } from '@/types/phone'

export type RegisterFields = {
  username: string
  email: string
  password: string
  phone_number: Phone
  time_zone: string
  country_code: string
  city: string
}

export type RegisterResponse = Record<string, never>
