import { BasicButton } from '@/shared/buttons/BasicButton'

type CostumerPanelEmptyViewProps = {
  onStartSearch: () => void
}

export const CostumerPanelEmptyView = ({
  onStartSearch,
}: CostumerPanelEmptyViewProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
      <span className="text-[14px] text-[var(--color-muted)]">No costumer selected.</span>
      <div className="flex items-center justify-end">
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: onStartSearch,
            className: 'px-3 py-2 text-xs',
            ariaLabel: 'Search costumer',
          }}
        >
          Search Costumer
        </BasicButton>
      </div>
    </div>
  )
}
