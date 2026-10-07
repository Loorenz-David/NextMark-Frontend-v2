import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { CostumerFormFields } from './CostumerFormFields'
import { CostumerFormFooter } from './CostumerFormFooter'
import { CostumerFormHeader } from './CostumerFormHeader'

/** Phone costumer form: fixed header and save bar, fields scroll between them. */
export const CostumerFormMobileLayout = ({ model }: { model: CostumerFormLayoutModel }) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--color-ligth-bg)]">
      <CostumerFormHeader
        label={model.label}
        mode={model.mode}
        isMobile={true}
        onClose={model.closeController.requestClose}
      />

      <CostumerFormFields model={model} compact={true} />

      <CostumerFormFooter onSave={model.handleSave} isMobile={true} />
    </div>
  )
}
