import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField, PLAIN_INPUT_CLASS, PLAIN_INPUT_CONTAINER_CLASS } from '@/shared/inputs/InputField'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { CustomInstructions } from '@/shared/layout/CustomInstructions'

import { useInviteMember } from './InviteMember.context'
import { useInviteMemberConfig } from './useInviteMemberConfig'
import { useInviteMemberRoleOptions } from './useInviteMemberRoleOptions'
import { useInviteMemberSetters } from './useInviteMemberSetters'
import { getInviteMemberInstructions } from './inviteMemberInstructions'

export const InviteMemberLayout = () => {
  const { formState, warnings, setFormState, handleSave, initialFormRef } = useInviteMember()

  const setters = useInviteMemberSetters({ setFormState, warnings })
  const { roleOptions, findRoleById } = useInviteMemberRoleOptions()
  const selectedRoleId = formState.user_role_id ? Number(formState.user_role_id) : null

  useInviteMemberConfig({ formState, initialFormRef })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: 'Send invite', action: handleSave },
    }),
    [handleSave],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-5 overflow-y-auto overflow-x-visible px-2 pb-[88px] scroll-thin">
        <div className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
          <div className="cell-default">
            <Field
              label="Email:"
              required={true}
              gap={2}
              warningPlacement="besidesLabel"
              warningController={warnings.emailWarning}
            >
              <InputField
                value={formState.target_email}
                onChange={(event) => setters.handleEmail(event?.target?.value ?? '')}
                warningController={warnings.emailWarning}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </div>

          <div className="cell-default border-t border-[var(--color-border-accent)]">
            <Field
              label="Role:"
              required={true}
              gap={2}
              warningPlacement="besidesLabel"
              warningController={warnings.roleWarning}
            >
              <OptionPopoverSelect<number>
                options={roleOptions}
                value={selectedRoleId}
                onChange={(roleId) => setters.handleRole(findRoleById(roleId))}
                placeholder="Select a role"
                allowEmpty={false}
                inputFieldClassName="flex w-full items-center justify-between"
              />
            </Field>
          </div>
        </div>

        <CustomInstructions
          steps={getInviteMemberInstructions()}
          className="rounded-2xl border border-border bg-surface-subtle p-4"
          scrollable={true}
          stepCardClassName="min-w-[320px]"
          stepCardMaxWidth={360}
        />
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
