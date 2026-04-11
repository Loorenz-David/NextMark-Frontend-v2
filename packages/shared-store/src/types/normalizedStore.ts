export type EntityState<T> = {
  byClientId: Record<string, T>
  idIndex: Record<number, string>
  allIds: string[]
}
