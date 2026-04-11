import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
  SyncExecutionState,
} from '@/app/contracts/routeExecution.types'
import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'
import type { DriverOrderStateIds } from '@/features/order-states'
import { optimisticTransaction } from '@shared-optimistic'
import { selectStopsByRouteId, useRoutesStore, useStopsStore } from '@/features/routes'
import { submitRouteActionAction } from '../actions/submitRouteAction.action'
import { markRouteActualEndTimeLastOrderAction } from '../actions/markRouteActualEndTimeLastOrder.action'
import {
  applyOrderCommandDeltas,
  createOrdersSnapshotByServerIds,
  patchOrderStateByServerIds,
  restoreOrdersSnapshot,
} from '@/features/routes/orders'
import { mapOrderCommandDeltas } from '../domain/mapOrderCommandDeltas'
import type {
  CompleteOrderResponseDto,
  FailOrderResponseDto,
  UndoTerminalOrderResponseDto,
} from '../api'
import {
  applyRouteActionResult,
  applyAssignedRouteOrderCommandDeltas,
  createAssignedRouteOrdersSnapshotByServerIds,
  patchAssignedRouteOrderStateByServerIds,
  restoreAssignedRouteOrdersSnapshot,
  setRouteActionFailure,
  setRouteActionSubmitting,
} from '../stores/routeExecution.mutations'
import type { RouteExecutionStore } from '../stores/routeExecution.store'

type SubmitRouteActionDependencies = {
  workspace: DriverWorkspaceContext | null
  store: RouteExecutionStore
  command: DriverRouteActionCommand
  orderStateIds: DriverOrderStateIds
}

function isOrderCommandResult(
  value:
    | DriverRouteActionResult
    | CompleteOrderResponseDto
    | FailOrderResponseDto
    | UndoTerminalOrderResponseDto
    | undefined,
): value is CompleteOrderResponseDto | FailOrderResponseDto | UndoTerminalOrderResponseDto {
  return Boolean(
    value
    && typeof value === 'object'
    && 'orders' in value
    && value.orders
    && typeof value.orders === 'object',
  )
}

export async function submitRouteActionFlow({
  workspace,
  store,
  command,
  orderStateIds,
}: SubmitRouteActionDependencies): Promise<DriverRouteActionResult> {
  if (!workspace) {
    return {
      syncState: 'terminal_failure',
      message: 'No active workspace.',
    }
  }

  const envelope: DriverCommandEnvelope<DriverRouteActionCommand> = {
    clientCommandId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    workspaceScopeKey: workspace.workspaceScopeKey,
    issuedAt: new Date().toISOString(),
    command,
  }

  setRouteActionSubmitting(store, envelope)

  const optimisticOrderStateId =
    command.type === 'complete-stop'
      ? orderStateIds.completedId
      : command.type === 'fail-stop'
        ? orderStateIds.failId
        : command.type === 'undo-stop-terminal'
          ? orderStateIds.processingId
          : null

  let result:
    | DriverRouteActionResult
    | CompleteOrderResponseDto
    | FailOrderResponseDto
    | UndoTerminalOrderResponseDto
    | undefined
  let requestError: unknown = null

  const didSucceed = await optimisticTransaction({
    snapshot: () => {
      const orderIds = typeof command.orderId === 'number' ? [command.orderId] : []
      return {
        sharedOrders: createOrdersSnapshotByServerIds(orderIds),
        assignedRouteOrders: createAssignedRouteOrdersSnapshotByServerIds(store, orderIds),
      }
    },
    mutate: () => {
      if (typeof command.orderId === 'number' && optimisticOrderStateId != null) {
        patchOrderStateByServerIds([command.orderId], optimisticOrderStateId)
        patchAssignedRouteOrderStateByServerIds(store, [command.orderId], optimisticOrderStateId)
      }
    },
    request: async () => {
      result = await submitRouteActionAction(envelope)
      return result
    },
    commit: (requestResult) => {
      if (isOrderCommandResult(requestResult)) {
        const mappedOrders = mapOrderCommandDeltas(requestResult.orders)
        applyOrderCommandDeltas(mappedOrders)
        applyAssignedRouteOrderCommandDeltas(store, mappedOrders)
      }
    },
    rollback: (snapshot) => {
      const optimisticSnapshot = snapshot as {
        sharedOrders: ReturnType<typeof createOrdersSnapshotByServerIds>
        assignedRouteOrders: ReturnType<typeof createAssignedRouteOrdersSnapshotByServerIds>
      }
      restoreOrdersSnapshot(optimisticSnapshot.sharedOrders)
      restoreAssignedRouteOrdersSnapshot(store, optimisticSnapshot.assignedRouteOrders)
    },
    onError: (error) => {
      requestError = error
    },
  })

  if (didSucceed) {
    if (
      (command.type === 'complete-stop' || command.type === 'fail-stop')
      && command.routeClientId
      && command.stopClientId
    ) {
      const routesState = useRoutesStore.getState()
      const routeRecord = routesState.byClientId[command.routeClientId] ?? null
      const routeStops = routeRecord
        ? [...selectStopsByRouteId(useStopsStore.getState(), routeRecord.id)]
          .sort((left, right) => (left.stop_order ?? Number.MAX_SAFE_INTEGER) - (right.stop_order ?? Number.MAX_SAFE_INTEGER))
        : []
      const lastStop = routeStops.at(-1)

      if (routeRecord?.id && lastStop?.client_id === command.stopClientId) {
        try {
          await markRouteActualEndTimeLastOrderAction(routeRecord.id, envelope.issuedAt)
        } catch (error) {
          console.error('Failed to record projected route end time', error)
        }
      }
    }

    const nextResult: DriverRouteActionResult = isOrderCommandResult(result)
      ? {
          syncState: 'synced' as SyncExecutionState,
          route: null,
        }
      : (result ?? {
          syncState: 'synced' as SyncExecutionState,
          route: null,
        })

    applyRouteActionResult(store, envelope, nextResult)
    return nextResult
  }

  console.error('Failed to submit route action', requestError)

  const failure: DriverRouteActionResult = {
    syncState: 'retryable_failure',
    message: 'Unable to send route action.',
  }

  setRouteActionFailure(store, envelope, failure.message ?? 'Unable to send route action.')
  return failure
}
