import { useNavigate } from 'react-router-dom'

import { ChevronDownIcon } from '@/assets/icons'
import { useLoginMutations } from '@/features/auth/login/hooks/useLoginMutations'

import { listSettingsLeafGroups, resolveSettingsRoute } from '../../domain/settingsSections'

/** The settings index on a phone: every section as a tappable row, grouped. */
export const SettingsMobileSectionList = () => {
  const navigate = useNavigate()
  const { logOutDevice } = useLoginMutations()
  const groups = listSettingsLeafGroups()

  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-6 pt-2">
      {groups.map((group) => (
        <section key={group.label} className="mb-4">
          <h2 className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {group.label}
          </h2>
          <div className="admin-glass-panel overflow-hidden rounded-2xl border border-[var(--color-border)]">
            {group.items.map((item, index) => {
              const route = resolveSettingsRoute(item.key)
              if (!route) return null
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(route)}
                  className={`flex min-h-13 w-full cursor-pointer items-center justify-between gap-3 px-4 text-left text-[0.95rem] text-[var(--color-text)] transition-colors active:bg-surface-hover ${
                    index > 0 ? 'border-t border-[var(--color-border)]/70' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 -rotate-90 text-[var(--color-muted)]" />
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={logOutDevice}
        className="mt-2 flex min-h-13 w-full cursor-pointer items-center justify-center rounded-2xl border border-danger-border px-4 text-[0.95rem] font-medium text-danger transition-colors active:bg-danger-bg"
      >
        Log out
      </button>
    </div>
  )
}
