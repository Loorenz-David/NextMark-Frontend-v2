import type { DriverOrderCommandDeltaCollectionDto } from './routeActionDeltas.types'

export type DriverOrderCommandDeltaPayload = {
  byClientId: DriverOrderCommandDeltaCollectionDto['byClientId']
  allIds: string[]
}

export function mapOrderCommandDeltas(
  dto: DriverOrderCommandDeltaCollectionDto,
): DriverOrderCommandDeltaPayload {
  return {
    byClientId: { ...dto.byClientId },
    allIds: [...dto.allIds],
  }
}
