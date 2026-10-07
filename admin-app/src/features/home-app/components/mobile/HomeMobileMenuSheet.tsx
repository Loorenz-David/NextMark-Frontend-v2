import { useNavigate } from 'react-router-dom'

import { ThemeToggle } from '@/app/theme'
import { SettingIcon } from '@/assets/icons'
import { useLoginMutations } from '@/features/auth/login/hooks/useLoginMutations'
import { BottomSheet } from '@/shared/overlays/bottomSheet'

import { HOME_WORKSPACE_OPTIONS } from '../../domain/homeWorkspace.types'
import { useHomeApp } from '../../providers/HomeAppProvider'
import { useHomeMobileShellStore } from '../../stores/homeMobileShell.store'

const rowClass =
  'flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[0.95rem] text-[var(--color-text)] transition-colors active:bg-surface-hover'

const sectionLabelClass =
  'px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]'

/**
 * Everything the desktop header offers that is not a tab: workspace switch,
 * theme, settings, log out.
 */
export const HomeMobileMenuSheet = () => {
  const navigate = useNavigate()
  const isMenuOpen = useHomeMobileShellStore((state) => state.isMenuOpen)
  const closeMenu = useHomeMobileShellStore((state) => state.closeMenu)
  const { activeWorkspace, setActiveWorkspace } = useHomeApp()
  const { logOutDevice } = useLoginMutations()

  return (
    <BottomSheet open={isMenuOpen} onClose={closeMenu} title="Menu" trackForBack={false}>
      <div className="flex flex-col pb-1">
        <div className={sectionLabelClass}>Workspace</div>
        <div role="radiogroup" aria-label="Workspace" className="flex flex-col gap-0.5">
          {HOME_WORKSPACE_OPTIONS.map((option) => {
            const isActive = option.value === activeWorkspace
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => {
                  setActiveWorkspace(option.value)
                  closeMenu()
                }}
                className={`${rowClass} ${isActive ? 'bg-surface-hover font-semibold' : ''}`}
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
        <div className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[0.95rem] text-[var(--color-text)]">
          <span className="min-w-0 flex-1">Theme</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => {
            closeMenu()
            navigate('/settings')
          }}
          className={rowClass}
        >
          <SettingIcon className="h-5 w-5 text-[var(--color-muted)]" />
          <span className="min-w-0 flex-1">Settings</span>
        </button>

        <div className="admin-glass-divider mt-2 border-t pt-2">
          <button
            type="button"
            onClick={() => {
              closeMenu()
              logOutDevice()
            }}
            className={`${rowClass} text-danger`}
          >
            <span className="min-w-0 flex-1">Log out</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
