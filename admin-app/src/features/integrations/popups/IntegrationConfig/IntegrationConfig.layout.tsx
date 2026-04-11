import { useMemo } from 'react'

import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useIntegrationConfig } from './IntegrationConfig.context'
import { useIntegrationConfigConfig } from './useIntegrationConfigConfig'




export const IntegrationConfigLayout = () => {
  const { payload, formState, initialFormRef,setters,  handleSave } = useIntegrationConfig()

  const { renderIntegrationForm } = useIntegrationConfigConfig({ payload, formState, initialFormRef, setters })

  const footerConfig = useMemo(
    () => ({
      saveButton: {
        label: payload.mode === 'create' ? 'Create' : 'Save',
        action: handleSave,
      },
    }),
    [handleSave, payload.mode],
  )
  


  return (
    <>
      <div className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">
        {renderIntegrationForm() ??
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted)]">
            Integration settings are coming soon.
          </div>
        }
       
      </div>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
