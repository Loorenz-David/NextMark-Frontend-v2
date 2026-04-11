type StepButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export const StepButton = ({
  label,
  onClick,
  disabled = false,
  type = 'button',
}: StepButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#83ccb9]/18 bg-[linear-gradient(135deg,#7ed3bd_0%,#5ed1d7_100%)] px-6 py-3 text-sm font-semibold text-[#11211f] shadow-[0_14px_34px_rgba(94,209,215,0.18)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}
