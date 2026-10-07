import type { SectionKey } from '../registry/sectionRegistry'

export type SettingsSectionKey = SectionKey | 'no-section'

export type SettingsSection = {
  key: SettingsSectionKey
  label: string
  sections?: SettingsSection[]
}

export const SETTINGS_ROUTE_MAP: Record<SectionKey, string> = {
  'user.main': '/settings/profile',
  'team.main': '/settings/team',
  'team.invitations': '/settings/team/invitations',
  'integrations.main': '/settings/integrations',
  'integrations.status': '/settings/integrations/status',
  'messages.main': '/settings/messages',
  'settings.configuration': '/settings',
  'item.main': '/settings/items',
  'vehicle.main': '/settings/vehicles',
  'facility.main': '/settings/facilities',
  'trustedDevice.main': '/settings/trusted-devices',
  'externalForm.access': '/settings/external-form',
  'externalForm.formConfig': '/settings/external-form/configuration',
  'printDocument.main': '/settings/print-templates/item',
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { key: 'user.main', label: 'Profile' },
  {
    key: 'team.main',
    label: 'Team',
    sections: [
      { key: 'team.main', label: 'Memebers' },
      { key: 'team.invitations', label: 'Invitations' },
    ],
  },
  { key: 'integrations.main', label: 'External Integrations' },
  { key: 'messages.main', label: 'Message Automations' },
  {
    key: 'no-section',
    label: 'Configuration',
    sections: [
      { key: 'item.main', label: 'Items' },
      { key: 'vehicle.main', label: 'Vehicles' },
      { key: 'facility.main', label: 'Facilities' },
      { key: 'printDocument.main', label: 'Print Templates' },
      { key: 'trustedDevice.main', label: 'Trusted Devices' },
    ],
  },
  {
    key: 'externalForm.access',
    label: 'External Form',
    sections: [
      { key: 'externalForm.access', label: 'Form Access' },
      { key: 'externalForm.formConfig', label: 'Form Configuration' },
    ],
  },
]

export const resolveSettingsRoute = (key: SettingsSectionKey): string | null =>
  key === 'no-section' ? null : SETTINGS_ROUTE_MAP[key]

/**
 * Longest route prefix wins, so `/settings/team/invitations` resolves to
 * "Invitations" and not "Team". Parent routes without a page (`no-section`)
 * never match.
 */
export const resolveSettingsSectionLabel = (pathname: string): string | null => {
  let best: { route: string; label: string } | null = null
  const visit = (section: SettingsSection) => {
    const route = resolveSettingsRoute(section.key)
    if (route && route !== '/settings') {
      const matches = pathname === route || pathname.startsWith(`${route}/`)
      if (matches && (!best || route.length > best.route.length)) {
        best = { route, label: section.label }
      }
    }
    section.sections?.forEach(visit)
  }
  SETTINGS_SECTIONS.forEach(visit)
  return best ? (best as { route: string; label: string }).label : null
}

/** Every leaf a phone list can open, grouped by its parent label. */
export const listSettingsLeafGroups = (): Array<{ label: string; items: SettingsSection[] }> =>
  SETTINGS_SECTIONS.map((section) => ({
    label: section.label,
    items: section.sections?.length ? section.sections : [section],
  }))
