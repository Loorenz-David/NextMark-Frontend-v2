import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { DriverCapabilities } from '../contracts/driverSession.types'
import { useSession } from '../providers/session.context'
import { useWorkspace } from '../providers/workspace.context'

type ProtectedRouteProps = PropsWithChildren<{
  capability?: keyof DriverCapabilities
}>

export function ProtectedRoute({ capability, children }: ProtectedRouteProps) {
  const location = useLocation()
  const { session } = useSession()
  const { workspace } = useWorkspace()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (capability && !workspace?.capabilities[capability]) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
