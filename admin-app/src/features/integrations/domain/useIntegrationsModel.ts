import type { IntegrationDefinition, IntegrationKey } from '../types/integration'

const DEFINITIONS: IntegrationDefinition[] = [
  {
    key: 'shopify',
    name: 'Shopify',
    description: 'Import orders and sync delivery updates.',
    iconKey: 'shopify',
  },
  {
    key: 'twilio',
    name: 'Twilio',
    description: 'Send automated SMS messages.',
    iconKey: 'twilio',
  },
  {
    key: 'email',
    name: 'Email',
    description: 'Send automated email messages.',
    iconKey: 'email',
  },
]

export const useIntegrationsModel = () => {
  const byKey = (key: IntegrationKey) =>
    DEFINITIONS.find((definition) => definition.key === key) ?? null

  return {
    definitions: DEFINITIONS,
    byKey,
  }
}
