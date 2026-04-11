import { useContext, useMemo } from 'react'

import {
  LocalDeliveryCommandsContext,
  LocalDeliveryStateContext,
} from './LocalDelivery.context'

export const useLocalDeliveryState = () => {
  const stateContext = useContext(LocalDeliveryStateContext)
  if (!stateContext) {
    throw new Error('useLocalDeliveryState must be used within LocalDeliveryProvider')
  }
  return stateContext
}

export const useLocalDeliveryCommands = () => {
  const commandsContext = useContext(LocalDeliveryCommandsContext)
  if (!commandsContext) {
    throw new Error('useLocalDeliveryCommands must be used within LocalDeliveryProvider')
  }
  return commandsContext
}

export const useLocalDeliveryContext = () => {
  const state = useLocalDeliveryState()
  const commands = useLocalDeliveryCommands()
  return useMemo(() => ({ ...state, ...commands }), [state, commands])
}
