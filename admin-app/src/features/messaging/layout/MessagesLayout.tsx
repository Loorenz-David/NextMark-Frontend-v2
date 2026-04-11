import type { ReactNode } from 'react'

export type MessagesTab<Key extends string = string> = {
  key: Key
  label: string
}

type MessagesLayoutProps<Key extends string> = {
  tabs: MessagesTab<Key>[]
  activeTab: Key
  onTabChange: (key: Key) => void
  children: ReactNode
}

export const MessagesLayout = <Key extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
}: MessagesLayoutProps<Key>) => (
  <section className="admin-glass-panel-strong flex w-full shrink-0 flex-col rounded-[28px] shadow-none">
    <div className="flex shrink-0 gap-4 border-b border-[var(--color-border)]/70 px-6 pb-5 pt-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === tab.key
              ? 'border border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.14)] text-[rgb(var(--color-light-blue-r))]'
              : 'border border-white/[0.05] bg-white/[0.04] text-[var(--color-text)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div className="bg-[var(--color-page)]/40">{children}</div>
  </section>
)
