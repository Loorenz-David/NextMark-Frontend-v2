import type { PropsWithChildren, ReactNode } from 'react'
import type { DriverCapabilities } from '@/app/contracts/driverSession.types'
import { useWorkspace } from '@/app/providers/workspace.context'

type CapabilityGateProps = PropsWithChildren<{
  capability: keyof DriverCapabilities
  fallback?: ReactNode
}>

export function CapabilityGate({ capability, children, fallback = null }: CapabilityGateProps) {
  const { workspace } = useWorkspace()

  if (!workspace?.capabilities[capability]) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
