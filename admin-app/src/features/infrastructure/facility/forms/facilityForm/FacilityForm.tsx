import { useMemo } from 'react'

import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useFacilityForm } from '../../popups/FacilityForm/FacilityForm.context'
import { useFacilityFormConfig } from '../../popups/FacilityForm/useFacilityFormConfig'

import { FacilityFormFields } from './components/FacilityFormFields'

export const FacilityFormFeature = () => {
  const { payload, formState, handleSave, initialFormRef } = useFacilityForm()

  useFacilityFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Create facility' : 'Save facility', action: handleSave },
    }),
    [handleSave, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-5 overflow-y-auto overflow-x-visible px-2 pb-[88px] scroll-thin">
        <FacilityFormFields />
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
