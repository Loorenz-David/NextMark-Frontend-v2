import type {
  DriverOrderCommandDeltaCollectionDto,
} from '../domain/routeActionDeltas.types'

export type CompleteOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
}

export type UndoTerminalOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
}

export type FailOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
}
