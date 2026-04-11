import type { StackComponentProps } from '@/shared/stack-manager/types'

import { IntegrationConfigProvider } from './IntegrationConfig.provider'
import { IntegrationConfigLayout } from './IntegrationConfig.layout'
import type { IntegrationConfigPayload } from './IntegrationConfig.types'

export const IntegrationConfig = ({ payload }: StackComponentProps<IntegrationConfigPayload>) => {
  if (!payload) return null

  return (
    <IntegrationConfigProvider payload={payload}>
      <IntegrationConfigLayout />
    </IntegrationConfigProvider>
  )
}
