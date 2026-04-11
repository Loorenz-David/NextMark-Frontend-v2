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
        'rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all',
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        variant === 'primary'
          ? 'bg-[#83ccb9] text-[#0f2220] shadow-[0_4px_14px_rgba(131,204,185,0.18)] hover:bg-[#97d6c5] hover:shadow-[0_6px_18px_rgba(131,204,185,0.26)]'
          : 'border border-white/12 bg-white/6 text-white/60 hover:bg-white/10 hover:text-white/90',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
