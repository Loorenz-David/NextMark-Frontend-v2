/**
 * Every create endpoint answers with a `client_id → new database id` map plus an
 * `ids_without_match` list, so optimistic rows can be reconciled to real ids.
 *
 * ```json
 * { "ids_without_match": [], "rule-tmp-1": 13 }
 * ```
 */
export type ClientFormCreateResponse = {
  ids_without_match?: string[]
} & Record<string, unknown>

export const readCreatedId = (
  response: ClientFormCreateResponse | undefined,
  clientId: string,
): number | null => {
  const value = response?.[clientId]
  return typeof value === 'number' ? value : null
}
