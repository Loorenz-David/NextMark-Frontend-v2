import type { Phone } from '@shared-domain'

export type DriverRegisterFormState = {
  username: string
  email: string
  password: string
  phone: Phone
  timeZone: string
}
