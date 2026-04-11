import { useContext } from 'react'

import { FacilityContext } from './FacilityContext'

export const useFacilityContext = () => {
  const context = useContext(FacilityContext)
  if (!context) {
    throw new Error('useFacilityContext must be used within FacilityProvider.')
  }
  return context
}
