import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'
import { InfoHover } from '@/shared/layout/InfoHover'

import {
  MESSAGE_TEMPLATE_ENABLED_INFO,
  MESSAGE_TEMPLATE_PERMISSION_INFO,
} from '@/features/messaging/info/templateToggles.info'
import { MessageScheduleControl } from '@/features/messaging/components'
import { useEmailMessageContext } from '../context/useEmailMessageContext'
import { EmailTemplateEditor } from '../components/EmailTemplateEditor'

export const EmailTemplateEditorPage = () => {
  const {
    activeTrigger,
    setActiveTrigger,
    enabled,
    permission,
    setPermission,
    setEnabled,
    schedule,
    setSchedule,
    value,
    setValue,
    saveTemplate,
  } = useEmailMessageContext()

  if (!activeTrigger) {
    return null
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)]/70 px-6 py-5">
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: () => setActiveTrigger(null),
            className: 'px-3 py-1 text-xs',
            ariaLabel: 'Back to templates list',
          }}
        >
          Back
        </BasicButton>
        <div className="flex items-end gap-10">
          <MessageScheduleControl
            eventKey={activeTrigger.key}
            value={schedule}
            onApply={setSchedule}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Ask for permission
              </span>
              <InfoHover content={MESSAGE_TEMPLATE_PERMISSION_INFO} />
            </div>
            <Switch
              value={ permission }
              onChange={ setPermission }
            />
          </div>
          <div className="flex flex-col  gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Enabled
              </span>
              <InfoHover content={MESSAGE_TEMPLATE_ENABLED_INFO} />
            </div>
            <Switch value={enabled} onChange={setEnabled}  />
          </div>
           <BasicButton
              params={{
                variant: 'primary',
                onClick: () => saveTemplate(),
                className: 'px-4 py-2 text-md',
                ariaLabel: 'Save template',
              }}
            >
              Save
            </BasicButton>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
            Email trigger
          </p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{activeTrigger.label}</h2>
          <p className="max-w-3xl text-sm text-[var(--color-muted)]">{activeTrigger.description}</p>
        </div>

      
        <EmailTemplateEditor value={value} onChange={setValue} />
      </div>
    </div>
  )
}
