import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { BackArrowIcon } from '@/assets/icons'

import { SettingsSectionSkeleton } from '../components/SettingsSectionSkeleton'
import { resolveSettingsSectionLabel } from '../domain/settingsSections'

const SETTINGS_INDEX_PATH = '/settings'

/**
 * Phone settings: a top bar with back + title above whichever section is
 * routed. At the index the back button returns home; inside a section it
 * returns to the index list.
 */
export const SettingsMobileView = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isIndex = pathname === SETTINGS_INDEX_PATH || pathname === `${SETTINGS_INDEX_PATH}/`
  const title = isIndex ? 'Settings' : (resolveSettingsSectionLabel(pathname) ?? 'Settings')

  return (
    <div className="admin-mobile-shell flex h-full min-h-0 w-full flex-col">
      <header className="admin-toolbar-strip safe-top relative z-30 flex w-full shrink-0 items-center gap-2 px-2 py-2">
        <button
          type="button"
          onClick={() => navigate(isIndex ? '/' : SETTINGS_INDEX_PATH)}
          aria-label={isIndex ? 'Back to home' : 'Back to settings'}
          className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-text)] active:bg-surface-hover"
        >
          <BackArrowIcon className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--color-text)]">
          {title}
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<SettingsSectionSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
