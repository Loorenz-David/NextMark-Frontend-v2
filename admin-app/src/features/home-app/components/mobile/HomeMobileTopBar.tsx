import { ActingUserButton } from '@/features/auth/trusted-device'
import { AdminNotificationsTrigger } from '@/realtime/notifications'

import { HOME_WORKSPACE_LABELS } from '../../domain/homeWorkspace.types'
import { useHomeApp } from '../../providers/HomeAppProvider'
import { useHomeMobileShellStore } from '../../stores/homeMobileShell.store'

const MenuIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

type HomeMobileTopBarProps = {
  inert?: boolean
}

export const HomeMobileTopBar = ({ inert = false }: HomeMobileTopBarProps) => {
  const { activeWorkspace } = useHomeApp()
  const openMenu = useHomeMobileShellStore((state) => state.openMenu)

  return (
    <header
      inert={inert}
      className="admin-toolbar-strip safe-top relative z-30 flex w-full shrink-0 items-center gap-2 px-3 py-2"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ActingUserButton />
        <h1 className="min-w-0 truncate text-base font-semibold text-[var(--color-text)]">
          {HOME_WORKSPACE_LABELS[activeWorkspace]}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <AdminNotificationsTrigger />
        <button
          type="button"
          onClick={openMenu}
          aria-label="Open menu"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[var(--color-text)] active:bg-surface-hover"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
