

type AssignedRouteFooterActionProps = {
  label: string
  placement?: 'flow' | 'bottom-fixed'
  onPress?: () => void
}

export function AssignedRouteFooterAction({
  label,
  placement = 'flow',
  onPress,
}: AssignedRouteFooterActionProps) {
  return (
    <section className={`px-5 flex items-center bg-[rgb(var(--bg-app-color))]/50 border-t border-[rgb(var(--bg-soft-light))]/40 ${placement === 'bottom-fixed' ? 'mt-auto flex-1 pb-10 pt-6' : 'mt-auto flex-1 pb-10 pt-12'}`}>
      <button
        className="flex min-h-12 w-full items-center justify-center rounded-lg border border-white/35 bg-white/6 px-4 text-base font-semibold text-cyan-300"
        onClick={onPress}
        type="button"
      >
        {label}
      </button>
    </section>
  )
}
