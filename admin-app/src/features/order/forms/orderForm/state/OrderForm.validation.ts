import type { OrderFormState, OrderFormWarnings } from './OrderForm.types'

export const useOrderFormValidation = ({
  formState,
  warnings,
}: {
  formState: OrderFormState
  warnings: OrderFormWarnings
}) => {
  const validateForm = () => {
   
    const firstNameValid = warnings.firstNameWarning.validate(formState.client_first_name)
    const lastNameValid = warnings.lastNameWarning.validate(formState.client_last_name)
    const emailValid = warnings.emailWarning.validate(formState.client_email)
    const primaryPhoneValid = warnings.primaryPhoneWarning.validate(formState.client_primary_phone)
    const addressValid = warnings.addressWarning.validate(formState.client_address)
    const deliveryWindowsValid = warnings.deliveryWindowsWarning.validate(formState.delivery_windows)

    return (
      firstNameValid &&
      lastNameValid &&
      emailValid &&
      primaryPhoneValid &&
      addressValid &&
      deliveryWindowsValid
    )
  }

  return {
    validateForm,
  }
}
