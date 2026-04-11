import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField, PLAIN_INPUT_CLASS, PLAIN_INPUT_CONTAINER_CLASS } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { PhoneField } from '@/shared/inputs/PhoneField/PhoneField'
import { normalizePhone } from '@/shared/data-validation/phoneValidation'
import { Cell, SplitRow } from '@/shared/layout/cells'

import { useUserEdit } from './UserEdit.context'
import { useUserEditConfig } from './useUserEditConfig'
import { useUserEditSetters } from './useUserEditSetters'

export const UserEditLayout = () => {
  const { formState, warnings, setFormState, handleSave, initialFormRef } = useUserEdit()

  const setters = useUserEditSetters({
    setFormState,
    warnings,
  })

  useUserEditConfig({ formState, initialFormRef })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: 'Save', action: handleSave },
    }),
    [handleSave],
  )

  
  return (
    <>
      <form className="flex h-full flex-col overflow-y-auto overflow-x-visible px-2 pb-[88px] scroll-thin">
        <div className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
          <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)] border-t-0">
            <Cell>
              <Field label="Username:" required={true} gap={2} warningPlacement="besidesLabel">
                <InputField
                  value={formState.username}
                  onChange={setters.handleUsername}
                  warningController={warnings.usernameWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
              {warnings.usernameWarning.warning.isVisible && (
                <div className="mt-3">
                  <InputWarning {...warnings.usernameWarning.warning} />
                </div>
              )}
            </Cell>

            <Cell>
              <Field label="Email:" required={true} gap={2} warningPlacement="besidesLabel">
                <InputField
                  value={formState.email}
                  onChange={setters.handleEmail}
                  warningController={warnings.emailWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
              {warnings.emailWarning.warning.isVisible && (
                <div className="mt-3">
                  <InputWarning {...warnings.emailWarning.warning} />
                </div>
              )}
            </Cell>
          </SplitRow>

          <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
            <Cell>
              <Field label="Phone:" gap={2} warningPlacement="besidesLabel">
                <PhoneField
                  phoneNumber={normalizePhone(formState.phone_number)}
                  onChange={setters.handlePhone}

                />
              </Field>
            </Cell>

            <Cell>
              <Field label="Change password:" required={true} gap={2} warningPlacement="besidesLabel">
                <InputField
                  value={formState.password}
                  onChange={setters.handlePassword}
                  type="password"
                  warningController={warnings.passwordWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
              {warnings.passwordWarning.warning.isVisible && (
                <div className="mt-3">
                  <InputWarning {...warnings.passwordWarning.warning} />
                </div>
              )}
            </Cell>
          </SplitRow>

          <div className="border-t border-[var(--color-border-accent)] cell-default">
            <Field label="Confirm new password:" required={true} gap={2} warningPlacement="besidesLabel">
              <InputField
                value={formState.password_confirmation}
                onChange={setters.handlePasswordConfirmation}
                type="password"
                warningController={warnings.passwordConfirmationWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
            {warnings.passwordConfirmationWarning.warning.isVisible && (
              <div className="mt-3">
                <InputWarning {...warnings.passwordConfirmationWarning.warning} />
              </div>
            )}
          </div>
        </div>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
