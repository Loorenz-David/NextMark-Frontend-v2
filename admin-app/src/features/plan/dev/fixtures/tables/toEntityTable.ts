export const toEntityTable = <T extends { client_id: string }>(entities: T[]) => ({
  byClientId: Object.fromEntries(
    entities.map((entity) => [entity.client_id, entity]),
  ) as Record<string, T>,
  allIds: entities.map((entity) => entity.client_id),
})
