import type { UserEditFormState, UserEditWarnings } from './UserEdit.types'

export const useUserEditValidation = ({
  formState,
  warnings,
}: {
  formState: UserEditFormState
  warnings: UserEditWarnings
}) => {
  const validateForm = () => {
    const usernameValid = warnings.usernameWarning.validate(formState.username)
    const emailValid = warnings.emailWarning.validate(formState.email)
    let passwordValid = true
    let confirmationValid = true

    if(  formState.password.trim().length > 0 ){
      passwordValid = warnings.passwordWarning.validate(formState.password)
      confirmationValid = warnings.passwordConfirmationWarning.validate({
        password: formState.password,
        confirmation: formState.password_confirmation,
      })
    }

    

    return usernameValid && emailValid && passwordValid && confirmationValid
  }

  return { validateForm }
}
