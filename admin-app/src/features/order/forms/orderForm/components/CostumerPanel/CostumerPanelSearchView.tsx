import { CostumerSearchBar, type Costumer } from '@/features/costumer'

type CostumerPanelSearchViewProps = {
  onSelectCostumer: (costumer: Costumer) => void
  onStartCreate: () => void
  selectedCostumerClientId?: string | null
}

export const CostumerPanelSearchView = ({
  onSelectCostumer,
  onStartCreate,
  selectedCostumerClientId,
}: CostumerPanelSearchViewProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
      <CostumerSearchBar
        onSelectCostumer={onSelectCostumer}
        handleStartCreate={onStartCreate}
        selectedCostumerClientId={selectedCostumerClientId}
      />
    </div>
  )
}
