export type IntegrationKey = 'shopify' | 'twilio' | 'email'

export type IntegrationDefinition = {
  key: IntegrationKey
  name: string
  description: string
  iconKey: IntegrationKey
}

export type IntegrationDefinitionWithStatus = IntegrationDefinition & {
  id: number | null
  isActive: boolean
}

export type IntegrationConfig = {
  client_id: string
  key: IntegrationKey
  id: number | null
  isActive: boolean
}

export type IntegrationMap = {
  byClientId: Record<string, IntegrationConfig>
  allIds: string[]
}
