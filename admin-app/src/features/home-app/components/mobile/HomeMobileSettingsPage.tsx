import { useNavigate } from 'react-router-dom'

import { ThemeToggle } from '@/app/theme'
import { ChevronDownIcon, SettingIcon } from '@/assets/icons'
import { useLoginMutations } from '@/features/auth/login/hooks/useLoginMutations'
import { ActingUserButton } from '@/features/auth/trusted-device'

import { HOME_WORKSPACE_OPTIONS } from '../../domain/homeWorkspace.types'
import { useHomeApp } from '../../providers/HomeAppProvider'

const rowClass =
  'flex min-h-13 w-full cursor-pointer items-center gap-3 px-4 text-left text-[0.95rem] text-[var(--color-text)] transition-colors active:bg-surface-hover'

const groupClass = 'admin-glass-panel overflow-hidden rounded-2xl border border-[var(--color-border)]'

const sectionLabelClass =
  'px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]'

/**
 * The Settings tab: everything the desktop header offers that is not a
 * list. Account switching, workspace, theme, the full settings area, and
 * log out.
 */
export const HomeMobileSettingsPage = () => {
  const navigate = useNavigate()
  const { activeWorkspace, setActiveWorkspace } = useHomeApp()
  const { logOutDevice } = useLoginMutations()

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="admin-glass-divider flex shrink-0 items-center gap-3 border-b px-4 py-3 shadow-[var(--shadow-panel-section)]">
        <div className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-hover px-3 py-3 shadow-[inset_0_1px_0_var(--color-ligth-bg)]">
          <SettingIcon className="h-6 w-6 text-[var(--color-muted)]" />
        </div>
        <div className="text-lg font-semibold text-[var(--color-text)]">Settings</div>
      </header>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 pb-8">
        <div className={sectionLabelClass}>Account</div>
        <div className={`${groupClass} flex min-h-13 items-center justify-between gap-3 px-4`}>
          <ActingUserButton />
          <button
            type="button"
            onClick={logOutDevice}
            className="min-h-11 shrink-0 cursor-pointer rounded-xl px-3 text-sm font-medium text-danger active:bg-danger-bg"
          >
            Log out
          </button>
        </div>

        <div className={sectionLabelClass}>Workspace</div>
        <div role="radiogroup" aria-label="Workspace" className={groupClass}>
          {HOME_WORKSPACE_OPTIONS.map((option, index) => {
            const isActive = option.value === activeWorkspace
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActiveWorkspace(option.value)}
                className={`${rowClass} ${index > 0 ? 'border-t border-[var(--color-border)]/70' : ''} ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-muted)]/40'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            )
          })}
        </div>

        <div className={sectionLabelClass}>App</div>
        <div className={groupClass}>
          <div className="flex min-h-13 items-center gap-3 px-4 text-[0.95rem] text-[var(--color-text)]">
            <span className="min-w-0 flex-1">Theme</span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={`${rowClass} border-t border-[var(--color-border)]/70`}
          >
            <span className="min-w-0 flex-1">Team, items, vehicles, integrations…</span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 -rotate-90 text-[var(--color-muted)]" />
          </button>
        </div>
      </div>
    </div>
  )
}
