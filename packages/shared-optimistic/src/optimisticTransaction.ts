import type { OptimisticTransactionConfig } from './types'

export async function optimisticTransaction<T>(
  config: OptimisticTransactionConfig<T>,
): Promise<boolean> {
  const { snapshot, mutate, request, commit, rollback, onError } = config
  const snap = snapshot()

  try {
    mutate()
    const result = await request()

    if (commit) {
      commit(result)
    }

    return true
  } catch (error) {
    rollback(snap)
    if (onError) {
      onError(error)
    }
    return false
  }
}
