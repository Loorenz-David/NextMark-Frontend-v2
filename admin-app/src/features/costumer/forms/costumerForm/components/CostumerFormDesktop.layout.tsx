import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { CostumerFormFields } from './CostumerFormFields'
import { CostumerFormFooter } from './CostumerFormFooter'
import { CostumerFormHeader } from './CostumerFormHeader'

export const CostumerFormDesktopLayout = ({ model }: { model: CostumerFormLayoutModel }) => {
  return (
    <div className="relative flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-page)]">
      <CostumerFormHeader
        label={model.label}
        mode={model.mode}
        isMobile={false}
        onClose={model.closeController.requestClose}
      />

      <CostumerFormFields model={model} />

      <CostumerFormFooter onSave={model.handleSave} />
    </div>
  )
}
