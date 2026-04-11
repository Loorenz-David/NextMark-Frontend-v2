import { DocumentIcon, EditIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'

type CostumerDetailHeaderProps = {
  onClose: () => void
  onEdit?: () => void
}

export const CostumerDetailHeader = ({ onClose, onEdit }: CostumerDetailHeaderProps) => {
  return (
    <>
      <div
        className="relative flex items-center justify-between gap-3 bg-[var(--color-primary)] px-4 py-3 shadow-md"
        style={{ borderRadius: '0 0 20px 20px' }}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)]/30 px-3 py-3">
            <DocumentIcon className="h-6 w-6 text-[var(--color-page)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-md font-semibold text-[var(--color-page)]/85">Costumer Details</span>
            <span className="text-[10px] font-normal text-[var(--color-page)]/80">
              Costumer information and related orders
            </span>
          </div>
        </div>

        <BasicButton
          params={{
            variant: 'textInvers',
            onClick: onClose,
            ariaLabel: 'Close costumer detail',
          }}
        >
          close
        </BasicButton>
      </div>
      <div className="flex items-center justify-end gap-3 bg-[var(--color-page)] px-4 py-3">
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: onEdit,
            ariaLabel: 'Edit costumer',
            disabled: !onEdit,
          }}
        >
          <EditIcon className="mr-2 h-4 w-4 stroke-[var(--color-primary)]" />
          Edit
        </BasicButton>
      </div>
    </>
  )
}
