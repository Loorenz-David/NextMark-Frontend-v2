import { validateString } from '@shared-domain'

import type { Item } from '../types'

export const useItemValidation = () => {
  const validateItemOrderId = (value: number) => Number.isFinite(value) && value > 0

  const validateItemArticleNumber = (value: string) => validateString(value)

  const validateItemType = (value: string) => validateString(value)

  const validateItemQuantity = (value: number) => Number.isFinite(value) && value > 0

  const validateItemDraft = (draft: Item) => {
    if (!validateItemOrderId(draft.order_id)) return false
    if (!validateItemArticleNumber(draft.article_number)) return false
    if (!validateItemType(draft.item_type)) return false
    if (!validateItemQuantity(draft.quantity)) return false

    return true
  }

  return {
    validateItemOrderId,
    validateItemArticleNumber,
    validateItemType,
    validateItemQuantity,
    validateItemDraft,
  }
}
