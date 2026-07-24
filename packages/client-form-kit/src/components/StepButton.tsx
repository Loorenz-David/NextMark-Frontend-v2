import { useClientForm } from '../context/useClientForm'

type Props = {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost'
}

export const StepButton = ({ label, onClick, disabled, variant = 'primary' }: Props) => {
  const { isSubmitting } = useClientForm()
  const isDisabled = disabled || isSubmitting

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'rounded-[var(--radius)] border px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors',
        isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        variant === 'primary'
          ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent-soft)]'
          : 'border-[var(--rule-strong)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
