export type OptimisticSnapshot = unknown

export type OptimisticTransactionConfig<T> = {
  snapshot: () => OptimisticSnapshot
  mutate: () => void
  request: () => Promise<T>
  commit?: (result: T) => void
  rollback: (snapshot: OptimisticSnapshot) => void
  onError?: (error: unknown) => void
}
