import type { Item } from '../../types'
import type { ItemFormWarnings } from './ItemForm.types'

export const useItemFormValidation = ({
  formState,
  warnings,
}: {
  formState: Item
  warnings: ItemFormWarnings
}) => {
  const validateForm = () => {
    const articleValid = warnings.articleNumberWarning.validate(formState.article_number)
    const itemTypeValid = warnings.itemTypeWarning.validate(formState.item_type)
    const quantityValid = warnings.quantityWarning.validate(formState.quantity)

    return articleValid && itemTypeValid && quantityValid
  }

  return {
    validateForm,
  }
}
