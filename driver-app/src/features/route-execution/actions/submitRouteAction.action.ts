import { completeOrderApi, failOrderApi } from '../api'
import { undoTerminalOrderAction } from './undoTerminalOrder.action'
import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
} from '@/app/contracts/routeExecution.types'
import type {
  CompleteOrderResponseDto,
  FailOrderResponseDto,
  UndoTerminalOrderResponseDto,
} from '../api'

export async function submitRouteActionAction(
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
): Promise<
  | DriverRouteActionResult
  | CompleteOrderResponseDto
  | FailOrderResponseDto
  | UndoTerminalOrderResponseDto
  | undefined
> {
  const { command } = envelope

  if (command.type === 'complete-stop') {
    if (typeof command.orderId !== 'number') {
      throw new Error('complete-stop requires orderId')
    }

    const response = await completeOrderApi(command.orderId)
    return response.data
  }

  if (command.type === 'fail-stop') {
    if (typeof command.orderId !== 'number') {
      throw new Error('fail-stop requires orderId')
    }

    if (!command.note?.trim()) {
      throw new Error('fail-stop requires a failure description')
    }

    const response = await failOrderApi(command.orderId, command.note.trim())
    return response.data
  }

  if (command.type === 'undo-stop-terminal') {
    if (typeof command.orderId !== 'number') {
      throw new Error('undo-stop-terminal requires orderId')
    }

    return undoTerminalOrderAction(command.orderId)
  }

  return undefined
}
