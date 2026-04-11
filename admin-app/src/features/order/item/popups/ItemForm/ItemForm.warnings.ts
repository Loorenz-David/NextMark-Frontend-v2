import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import { useItemValidation } from '../../domain/useItemValidation'

export const useItemFormWarnings = () => {
  const validation = useItemValidation()

  const articleNumberWarning = useInputWarning('Article number is required.', (value, setMessage) => {
    const isValid = validation.validateItemArticleNumber(String(value ?? ''))
    if (!isValid) {
      setMessage('Article number is required.')
    }
    return isValid
  })

  const itemTypeWarning = useInputWarning('Item type is required.', (value, setMessage) => {
    const isValid = validation.validateItemType(String(value ?? ''))
    if (!isValid) {
      setMessage('Item type is required.')
    }
    return isValid
  })

  const quantityWarning = useInputWarning('Quantity must be greater than zero.', (value, setMessage) => {
    const quantity = Number(value)
    const isValid = validation.validateItemQuantity(quantity)
    if (!isValid) {
      setMessage('Quantity must be greater than zero.')
    }
    return isValid
  })

  return {
    articleNumberWarning,
    itemTypeWarning,
    quantityWarning,
  }
}
