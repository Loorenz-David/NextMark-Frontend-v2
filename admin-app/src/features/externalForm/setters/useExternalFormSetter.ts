import { useState } from 'react'

import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

import type { ExternalFormData } from '../domain/externalForm.types'

export const useExternalFormSetter = () => {
  const [form, setForm] = useState<ExternalFormData>({
    client_first_name: '',
    client_last_name: '',
    client_primary_phone: null,
    client_secondary_phone: null,
    client_email: '',
    client_address: null,
  })

  const setClientFirstName = (value: string) => setForm((prev) => ({ ...prev, client_first_name: value }))

  const setClientLastName = (value: string) => setForm((prev) => ({ ...prev, client_last_name: value }))

  const setPrimaryPhone = (value: Phone | null) => setForm((prev) => ({ ...prev, client_primary_phone: value }))

  const setSecondaryPhone = (value: Phone | null) => setForm((prev) => ({ ...prev, client_secondary_phone: value }))

  const setEmail = (value: string) => setForm((prev) => ({ ...prev, client_email: value }))

  const setAddress = (value: address | null) => setForm((prev) => ({ ...prev, client_address: value }))

  return {
    form,
    setters: {
      setClientFirstName,
      setClientLastName,
      setPrimaryPhone,
      setSecondaryPhone,
      setEmail,
      setAddress,
    },
  }
}

export type ExternalFormSetterState = ReturnType<typeof useExternalFormSetter>
export type ExternalFormSetters = ExternalFormSetterState['setters']
