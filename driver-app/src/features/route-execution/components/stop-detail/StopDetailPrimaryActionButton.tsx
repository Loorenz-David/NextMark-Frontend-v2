import { BoldCheckIcon, NavigateIcon,  TriangleWarningIcon } from '@/assets/icons'
import type { StopDetailPrimaryActionDisplay } from '../../domain/stopDetailDisplay.types'

type StopDetailPrimaryActionButtonProps = {
  action: StopDetailPrimaryActionDisplay
}

const toneClassMap: Record<StopDetailPrimaryActionDisplay['tone'], string> = {
  navigate: 'bg-[rgba(124,163,255,0.88)] text-white',
  failed: 'bg-red-300/8 text-red-600',
  completed: 'bg-[rgba(0,232,255,0.16)] text-cyan-300',
}

function PrimaryActionIcon({ id }: { id: StopDetailPrimaryActionDisplay['id'] }) {
  const className = 'h-5 w-5'

  if (id === 'navigate') {
    return <NavigateIcon aria-hidden="true" className={className} />
  }

  if (id === 'failed') {
    return <TriangleWarningIcon aria-hidden="true" className={className} />
  }

  return <BoldCheckIcon aria-hidden="true" className={className} />
}

export function StopDetailPrimaryActionButton({
  action,
}: StopDetailPrimaryActionButtonProps) {
  return (
    <button
      className={`flex min-h-18 w-full flex-col items-center justify-center rounded-2xl border border-white/20 px-3 py-3 text-center ${toneClassMap[action.tone]}`}
      onClick={action.onPress}
      type="button"
    >
      <span className="flex h-5 items-center justify-center">
        <PrimaryActionIcon id={action.id} />
      </span>
      <span className="mt-2 text-sm font-semibold">{action.label}</span>
    </button>
  )
}
