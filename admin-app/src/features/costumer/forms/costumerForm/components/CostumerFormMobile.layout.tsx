import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { CostumerFormFields } from './CostumerFormFields'
import { CostumerFormFooter } from './CostumerFormFooter'
import { CostumerFormHeader } from './CostumerFormHeader'

export const CostumerFormMobileLayout = ({ model }: { model: CostumerFormLayoutModel }) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto scroll-thin overflow-x-hidden pb-28">
      <div className="relative flex w-full min-h-0 flex-col bg-[var(--color-page)]">
        <CostumerFormHeader
          label={model.label}
          mode={model.mode}
          isMobile={true}
          onClose={model.closeController.requestClose}
        />

        <CostumerFormFields model={model} compact={true} />
      </div>

      <CostumerFormFooter onSave={model.handleSave} isMobile={true} />
    </div>
  )
}
