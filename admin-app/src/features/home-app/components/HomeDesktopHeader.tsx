import { useNavigate } from 'react-router-dom'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { SettingIcon } from '@/assets/icons'
import {
  AdminNotificationsPushCta,
  AdminNotificationsTrigger,
} from '@/realtime/notifications'
import { useHomeApp } from '../providers/HomeAppProvider'
import { HOME_WORKSPACE_OPTIONS } from '../domain/homeWorkspace.types'
import type { HomeWorkspaceType } from '../domain/homeWorkspace.types'

export function HomeDesktopHeader() {
  const navigate = useNavigate()
  const { activeWorkspace, setActiveWorkspace, headerActions } = useHomeApp()

  return (
    <div className="admin-toolbar-strip relative z-30 mx-auto flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-6 py-3">
      {/* Left — workspace switcher */}
      <div className="flex shrink-0 items-center">
        <select
          value={activeWorkspace}
          onChange={(e) => setActiveWorkspace(e.target.value as HomeWorkspaceType)}
          className="cursor-pointer rounded-xl border border-[var(--color-muted)]/24 bg-transparent px-3 py-[5px] text-sm text-[var(--color-text)] outline-none focus:ring-1 focus:ring-[var(--color-muted)]/40"
        >
          {HOME_WORKSPACE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right — actions */}
      <div className="flex shrink-0 items-center gap-2 rounded-[1.15rem]">
        {headerActions}
        <AdminNotificationsPushCta visibility="enable-only" />
        <div className="pr-2">
          <AdminNotificationsTrigger />
        </div>
        <BasicButton
          params={{
            variant: 'toolbarSecondary',
            ariaLabel: 'Settings',
            className: 'border-[var(--color-muted)]/24 px-4 py-[5px]',
            onClick: () => navigate('/settings'),
          }}
        >
          <SettingIcon className="mr-2 h-4 w-4" />
          Settings
        </BasicButton>
      </div>
    </div>
  )
}
