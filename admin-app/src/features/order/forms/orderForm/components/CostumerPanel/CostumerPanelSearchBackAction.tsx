import { BackArrowIcon2 } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

type CostumerPanelSearchBackActionProps = {
  onClick: () => void
}

export const CostumerPanelSearchBackAction = ({
  onClick,
}: CostumerPanelSearchBackActionProps) => {
  return (
    <BasicButton
      params={{
        variant: 'ghost',
        onClick,
        className: 'flex items-center gap-1 px-1 py-1 text-[11px] text-[var(--color-muted)]',
        ariaLabel: 'Back to selected costumer',
      }}
    >
      <BackArrowIcon2 className="h-3.5 w-3.5" />
      Back
    </BasicButton>
  )
}
