import { BasicButton } from '@/shared/buttons/BasicButton'

type CostumerFormFooterProps = {
  onSave: () => void
  isMobile?: boolean
}

export const CostumerFormFooter = ({ onSave, isMobile = false }: CostumerFormFooterProps) => {
  return (
    <footer
      className={`z-20 flex w-full items-center justify-end border-t border-[var(--color-border)] bg-[var(--color-page)] px-6 py-4 ${
        isMobile ? 'fixed bottom-0 left-0 rounded-none' : 'absolute bottom-0 left-0 rounded-b-xl'
      }`}
    >
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
