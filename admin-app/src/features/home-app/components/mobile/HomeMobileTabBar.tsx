import { HOME_MOBILE_TABS } from '../../domain/homeMobileTabs'
import { useHomeMobileShellStore } from '../../stores/homeMobileShell.store'

type HomeMobileTabBarProps = {
  inert?: boolean
}

export const HomeMobileTabBar = ({ inert = false }: HomeMobileTabBarProps) => {
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
              <Icon className="h-6 w-6" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
