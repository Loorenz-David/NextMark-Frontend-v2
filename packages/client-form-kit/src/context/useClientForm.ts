import { useContext } from 'react'
import { ClientFormContext } from './ClientForm.context'

export const useClientForm = () => {
  const ctx = useContext(ClientFormContext)
  if (!ctx) throw new Error('useClientForm must be used within ClientFormProvider')
  return ctx
}
