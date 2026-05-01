import { useCallback, useMemo, useState } from 'react'
import type { availableOrientations, availableVariants, PrintTemplate } from '../types'
import { buildTemplateClientId } from '../domain/printTemplate.normalization'
import { getTemplateVariantsMapByChannel } from '../domain/templateVariants.map'

export const usePrintTemplateForm = ()=>{
    const [formState, setFormState] = useState<PrintTemplate | null>(null)

    const buildInitialTemplateForm = useCallback(
      (channel: PrintTemplate['channel'], event: PrintTemplate['event']): PrintTemplate => {
        const variantMap = getTemplateVariantsMapByChannel(channel)
        const availableVariantList = Object.keys(variantMap) as availableVariants[]

        const defaultVariant = 'classic' in variantMap ? 'classic' : availableVariantList[0]
        const variantDefinition = defaultVariant ? variantMap[defaultVariant] : undefined
        const defaultOrientation = variantDefinition?.orientation ?? 'vertical'

        return initialTemplateForm(
          channel,
          event,
          defaultVariant ?? 'classic',
          defaultOrientation,
        )
      },
      [],
    )
    const togglePermission = useCallback((next:boolean)=>{
        setFormState((prev) => (prev ? { ...prev, ask_permission: next } : prev))
    }, [])

    const toggleEnable = useCallback((next:boolean)=>{
        setFormState((prev) => (prev ? { ...prev, enable: next } : prev))
    }, [])

    const changeOrientation = useCallback((value:availableOrientations)=>{
        setFormState((prev) => (prev ? { ...prev, orientation: value } : prev))
    }, [])
    const changeVariant = useCallback((variant:availableVariants )=>{
        setFormState((prev) => {
          if (!prev) return prev
          const variantDefinition = getTemplateVariantsMapByChannel(prev.channel)[variant]
          return {
            ...prev,
            selected_variant: variant,
            orientation: variantDefinition?.orientation ?? prev.orientation,
          }
        })
    }, [])

    const resetForm = useCallback(()=>{
        setFormState(null)
    }, [])
    
    return useMemo(() => ({
        formState,
        buildInitialTemplateForm,
        resetForm,
        setFormState,
        toggleEnable,
        togglePermission,
        changeVariant,
        changeOrientation
    }), [
      formState,
      buildInitialTemplateForm,
      resetForm,
      toggleEnable,
      togglePermission,
      changeVariant,
      changeOrientation,
    ])
}

const initialTemplateForm = (
  channel: PrintTemplate['channel'],
  event: PrintTemplate['event'],
  variant: availableVariants,
  orientation: availableOrientations,
): PrintTemplate => ({
    client_id: buildTemplateClientId(channel, event),
    enable: false,
    channel,
    selected_variant: variant,
    orientation,
    ask_permission: false,
    event,
})
