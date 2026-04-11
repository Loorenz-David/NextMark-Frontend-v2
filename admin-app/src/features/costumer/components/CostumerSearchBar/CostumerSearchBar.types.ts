import type { Costumer } from '../../dto/costumer.dto'

export type CostumerSearchBarProps = {
  onSelectCostumer: (costumer: Costumer) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  limit?: number
  initialQuery?: string
  handleStartCreate: () => void
  selectedCostumerClientId?: string | null
}
