import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField, PLAIN_INPUT_CLASS, PLAIN_INPUT_CONTAINER_CLASS } from '@/shared/inputs/InputField'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { CustomInstructions } from '@/shared/layout/CustomInstructions'
import { Cell, SplitRow } from '@/shared/layout/cells'

import { useInviteMember } from './InviteMember.context'
import { useInviteMemberConfig } from './useInviteMemberConfig'
import { useInviteMemberSetters } from './useInviteMemberSetters'
import { getInviteMemberInstructions } from './inviteMemberInstructions'

export const InviteMemberLayout = () => {
  const { formState, warnings, setFormState, handleSave, initialFormRef } = useInviteMember()

  const setters = useInviteMemberSetters({ setFormState, warnings })

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

          <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
            <Cell>
              <Field
                label="Role name:"
                required={true}
                gap={2}
                warningPlacement="besidesLabel"
                warningController={warnings.roleNameWarning}
              >
                <InputField
                  value={formState.user_role_name}
                  onChange={(event) => setters.handleRoleName(event?.target?.value ?? '')}
                  warningController={warnings.roleNameWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>

            <Cell>
              <Field
                label="Role id:"
                required={true}
                gap={2}
                warningPlacement="besidesLabel"
                warningController={warnings.roleIdWarning}
              >
                <InputField
                  value={formState.user_role_id}
                  onChange={(event) => setters.handleRoleId(event?.target?.value ?? '')}
                  warningController={warnings.roleIdWarning}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>
          </SplitRow>
        </div>

        <CustomInstructions
          steps={getInviteMemberInstructions()}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
          scrollable={true}
          stepCardClassName="min-w-[320px]"
          stepCardMaxWidth={360}
        />
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
