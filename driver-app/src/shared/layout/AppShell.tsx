import { NavLink, Outlet } from 'react-router-dom'
import { useConnectivity } from '@/app/providers/connectivity.context'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { CapabilityGate } from '@/shared/components'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `driver-nav__link${isActive ? ' driver-nav__link--active' : ''}`

export function AppShell() {
  const { isOnline } = useConnectivity()
  const { clearSession } = useSession()
  const { workspace } = useWorkspace()

  return (
    <div className="driver-app-shell">
      <header className="driver-topbar">
        <div>
          <div className="driver-kicker">Driver Workspace</div>
          <h1 className="driver-title">Route Pilot</h1>
          <p className="driver-subtitle">
            {workspace?.currentWorkspace === 'team'
              ? 'Team workspace'
              : 'Personal workspace'}
          </p>
        </div>
        <div className="driver-topbar__actions">
          <span className={`driver-status-pill ${isOnline ? 'is-online' : 'is-offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button className="ghost-button" onClick={clearSession}>Sign out</button>
        </div>
      </header>
      <main className="driver-main">
        <Outlet />
      </main>

      <nav className="driver-nav">
        <NavLink className={linkClassName} to="/route">Assigned Route</NavLink>
        <CapabilityGate capability="canCreateOrders">
          <NavLink className={linkClassName} to="/create/order">Quick Order</NavLink>
        </CapabilityGate>
        <CapabilityGate capability="canCreateRoutes">
          <NavLink className={linkClassName} to="/create/route">Quick Route</NavLink>
        </CapabilityGate>
      </nav>
    </div>
  )
}
