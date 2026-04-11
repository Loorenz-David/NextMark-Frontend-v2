import { useContext, useMemo } from 'react'

import {
  RouteGroupPageCommandsContext,
  RouteGroupPageStateContext,
} from './RouteGroupPage.context'

export const useRouteGroupPageState = () => {
  const stateContext = useContext(RouteGroupPageStateContext)
  if (!stateContext) {
    throw new Error('useRouteGroupPageState must be used within RouteGroupPageProvider')
  }
  return stateContext
}

export const useRouteGroupPageCommands = () => {
  const commandsContext = useContext(RouteGroupPageCommandsContext)
  if (!commandsContext) {
    throw new Error('useRouteGroupPageCommands must be used within RouteGroupPageProvider')
  }
  return commandsContext
}

export const useRouteGroupPageContext = () => {
  const state = useRouteGroupPageState()
  const commands = useRouteGroupPageCommands()
  return useMemo(() => ({ ...state, ...commands }), [state, commands])
}
