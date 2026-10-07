import { HOME_MOBILE_TABS } from '../../domain/homeMobileTabs'
import type { HomeMobileTabId } from '../../domain/homeMobileShell.types'
import { useHomeMobileShellStore } from '../../stores/homeMobileShell.store'

type HomeMobileTabBarProps = {
  inert?: boolean
  /** Unread-style counts shown as a badge on the tab icon. */
  badges?: Partial<Record<HomeMobileTabId, number>>
}

export const HomeMobileTabBar = ({ inert = false, badges }: HomeMobileTabBarProps) => {
  const activeTab = useHomeMobileShellStore((state) => state.activeTab)
  const setActiveTab = useHomeMobileShellStore((state) => state.setActiveTab)

  return (
    <nav
      inert={inert}
      aria-label="Primary"
      className="admin-toolbar-strip safe-bottom relative z-30 flex w-full shrink-0 border-t border-[var(--color-border)]"
    >
      <div className="flex w-full items-stretch">
        {HOME_MOBILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon
          const badge = badges?.[tab.id] ?? 0
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-2 pt-1.5 pb-1 text-[11px] font-medium transition-colors active:bg-surface-hover ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
              }`}
            >
              <span className="relative">
                <Icon className="h-6 w-6" />
                {badge > 0 ? (
                  <span className="absolute -right-2 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[rgb(var(--color-danger-r))] px-1 text-[9px] font-semibold text-danger-on-solid">
                    {badge > 99 ? '99+' : badge}
                  </span>
                ) : null}
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
