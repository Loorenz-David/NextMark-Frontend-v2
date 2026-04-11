import { useCostumerForm } from './context/CostumerForm.context'

export const useCostumerFormLayoutModel = () => {
  const { formState, warnings, formSetters, actions, meta, closeController } = useCostumerForm()

  return {
    label: meta.mode === 'create' ? 'Create Costumer' : 'Edit Costumer',
    mode: meta.mode,
    formState,
    warnings,
    formSetters,
    handleSave: actions.handleSave,
    closeController,
  }
}

export type CostumerFormLayoutModel = ReturnType<typeof useCostumerFormLayoutModel>
