import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'
import { InfoHover } from '@/shared/layout/InfoHover'

import {
  MESSAGE_TEMPLATE_ENABLED_INFO,
  MESSAGE_TEMPLATE_PERMISSION_INFO,
} from '@/features/messaging/info/templateToggles.info'
import { SmsTemplateEditor } from '../components/SmsTemplateEditor'
import { useSmsMessageContext } from '../context/useSmsMessageContext'

export const SmsTemplateEditorPage = () => {
  const {
    activeTrigger,
    setActiveTrigger,
    enabled,
    permission,
    setPermission,
    setEnabled,
    value,
    setValue,
    saveTemplate,
  } = useSmsMessageContext()

  if (!activeTrigger) {
    return null
  }
 
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="admin-glass-panel-strong flex items-center justify-between rounded-[26px] px-5 py-4 shadow-none">
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
      <div className="flex flex-col gap-2 px-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
          SMS trigger
        </p>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">{activeTrigger.label}</h2>
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">{activeTrigger.description}</p>
      </div>
      <SmsTemplateEditor value={value} onChange={setValue} />
    </div>
  )
}
