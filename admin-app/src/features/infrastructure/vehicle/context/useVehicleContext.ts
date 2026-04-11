import { useContext } from 'react'

import { VehicleContext } from './VehicleContext'

export const useVehicleContext = () => {
  const context = useContext(VehicleContext)
  if (!context) {
    throw new Error('useVehicleContext must be used within VehicleProvider.')
  }
  return context
}
