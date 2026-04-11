import type { StopDetailPrimaryActionDisplay } from '../../domain/stopDetailDisplay.types'
import { StopDetailPrimaryActionButton } from './StopDetailPrimaryActionButton'

type StopDetailPrimaryActionsProps = {
  actions: StopDetailPrimaryActionDisplay[]
}

export function StopDetailPrimaryActions({ actions }: StopDetailPrimaryActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <StopDetailPrimaryActionButton
          action={action}
          key={action.id}
        />
      ))}
    </div>
  )
}
