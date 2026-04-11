import { useMemo, useSyncExternalStore } from 'react'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { usePwaInstallPrompt } from '@/app/pwa/usePwaInstallPrompt'
import { RoutesList, selectRouteFromSideMenuFlow } from '@/features/routes'
import { useDriverAppShell } from '../../providers/driverAppShell.context'
import { selectSideMenuState } from '../../stores/shell.selectors'
import { LogoutButton } from './LogoutButton'
import { UserCard } from './UserCard'
import { WorkspaceModeSection } from './WorkspaceModeSection'

export function SideMenuSurface() {
  const shell = useDriverAppShell()
  const { workspace } = useWorkspace()
  const { clearSession, session } = useSession()
  const { store, closeSideMenu } = shell
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])
  const userName = resolveUserName(session)
  const userEmail = resolveUserEmail(session)
  const { canInstall, isInstalling, promptInstall } = usePwaInstallPrompt()

  return (
    <section className={` driver-side-menu-surface${sideMenuState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close side menu"
        className="driver-side-menu-surface__backdrop"
        onClick={closeSideMenu}
        type="button"
      />
      <aside className="driver-side-menu-surface__panel bg-[rgba(var(--bg-app-color),0.90)] backdrop-blur-[40px] backdrop-saturate-[115%] backdrop-contrast-[92%]">
        <div className="flex h-full flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col border-b border-white/10">
            {canInstall ? (
              <div className="px-2 pt-4">
                <button
                  className="flex w-full items-center justify-center rounded-2xl border border-white/12 bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(31,111,93,0.28)] transition hover:bg-[color-mix(in_srgb,var(--accent)_88%,white)] disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => {
                    void promptInstall()
                  }}
                  type="button"
                >
                  {isInstalling ? 'Opening install prompt...' : 'Install app'}
                </button>
              </div>
            ) : null}
            <div className=" px-2 pt-4">
              <UserCard
                email={userEmail}
                name={userName}
              />
            </div>

            <WorkspaceModeSection />
          </div>

          <div className="flex h-[300px] flex-col gap-4 overflow-hidden px-2">
            <header className="space-y-1">
              <h2 className="text-md font-semibold text-white">Routes</h2>
            </header>
            <div className="h-full min-h-0 overflow-y-auto px-2">
              <RoutesList
                onSelectRoute={(routeClientId) => {
                  if (!workspace) {
                    return
                  }

                  selectRouteFromSideMenuFlow({
                    routeClientId,
                    workspaceScopeKey: workspace.workspaceScopeKey,
                    shell,
                  })
                }}
              />
              
            </div>
          </div>

          <div className="mt-auto px-4 pb-5 pt-4">
            <LogoutButton
              onLogout={() => {
                closeSideMenu()
                clearSession()
              }}
            />
          </div>
        </div>
      </aside>
    </section>
  )
}

function resolveUserName(session: ReturnType<typeof useSession>['session']) {
  const username = session?.user?.username
  if (typeof username === 'string' && username.trim()) {
    return username.trim()
  }

  const email = session?.user?.email
  if (typeof email === 'string' && email.trim()) {
    return email.trim()
  }

  return 'Driver user'
}

function resolveUserEmail(session: ReturnType<typeof useSession>['session']) {
  const email = session?.user?.email
  if (typeof email === 'string' && email.trim()) {
    return email.trim()
  }

  return null
}
