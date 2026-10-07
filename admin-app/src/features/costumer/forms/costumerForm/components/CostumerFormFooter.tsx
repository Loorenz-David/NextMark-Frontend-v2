import { BasicButton } from '@/shared/buttons/BasicButton'

type CostumerFormFooterProps = {
  onSave: () => void
  isMobile?: boolean
}

export const CostumerFormFooter = ({ onSave, isMobile = false }: CostumerFormFooterProps) => {
  if (isMobile) {
    return (
      <footer className="safe-bottom z-20 flex w-full shrink-0 items-center border-t border-[var(--color-border)] bg-[var(--color-page)] px-4 pt-3 pb-3">
        <BasicButton
          params={{
            variant: 'primary',
            onClick: onSave,
            className: 'h-12 w-full rounded-2xl text-[15px]',
            ariaLabel: 'Save costumer',
          }}
        >
          Save costumer
        </BasicButton>
      </footer>
    )
  }

  return (
    <footer className="absolute bottom-0 left-0 z-20 flex w-full items-center justify-end rounded-b-xl border-t border-[var(--color-border)] bg-[var(--color-page)] px-6 py-4">
      <BasicButton
        params={{
          variant: 'primary',
          onClick: onSave,
          className: 'px-5 py-2',
        }}
      >
        Save Costumer
      </BasicButton>
    </footer>
  )
}
