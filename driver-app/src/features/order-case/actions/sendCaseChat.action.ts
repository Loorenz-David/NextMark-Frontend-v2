import { createCaseChatApi } from '../api'
import type { CaseChatCreateFields } from '../domain'

export async function sendCaseChatAction(payload: CaseChatCreateFields) {
  const response = await createCaseChatApi(payload)
  return response.data
}
