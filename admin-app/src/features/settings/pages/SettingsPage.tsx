import { useMobile } from '@/app/contexts/MobileContext'
import { Navigate, Route, Routes } from 'react-router-dom'

import { PrintTemplateChannelPage } from '@/features/templates/printDocument/pages/PrintTemplateChannelPage'
import { PrintTemplateConfigPage } from '@/features/templates/printDocument/pages/PrintTemplateConfigPage'
import { SettingsProvider } from '../context/SettingsProvider'
import { SettingsOverlays } from '../components/SettingsOverlays'
import { sectionRegistry } from '../registry/sectionRegistry'
import { SettingsDesktopView } from '../views/SettingsDesktopView'
import { SettingsMobileView } from '../views/SettingsMobileView'

const SettingsView = () => {
  const { isMobile } = useMobile()

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
      <SettingsOverlays />
      <div className="flex h-full w-screen flex-col overflow-hidden">
        {isMobile ? <SettingsMobileView /> : <SettingsDesktopView />}
      </div>
    </div>
  )
}

export const SettingsPage = () => {
  const UserMain = sectionRegistry['user.main']
  const TeamMain = sectionRegistry['team.main']
  const TeamInvitations = sectionRegistry['team.invitations']
  const IntegrationsMain = sectionRegistry['integrations.main']
  const IntegrationStatusPage = sectionRegistry['integrations.status']
  const MessagesMainPage = sectionRegistry['messages.main']
  const ItemsMain = sectionRegistry['item.main']
  const VehiclesMain = sectionRegistry['vehicle.main']
  const FacilitiesMain = sectionRegistry['facility.main']
  const PrintDocumentMain = sectionRegistry['printDocument.main']
  const ExternalFormAccess = sectionRegistry['externalForm.access']
  return (
    <SettingsProvider>
      <Routes>
        <Route element={<SettingsView />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<UserMain />} />
          <Route path="team" element={<TeamMain />} />
          <Route path="team/invitations" element={<TeamInvitations />} />
          <Route path="integrations" element={<IntegrationsMain />} />
          <Route path="integrations/status" element={<IntegrationStatusPage />} />
          <Route path="messages" element={<MessagesMainPage />} />
          <Route path="items" element={<ItemsMain />} />
          <Route path="vehicles" element={<VehiclesMain />} />
          <Route path="facilities" element={<FacilitiesMain />} />
          <Route path="external-form" element={<ExternalFormAccess />} />
          <Route path="print-templates" element={<PrintDocumentMain />}>
            <Route path=":channel" element={<PrintTemplateChannelPage />} />
            <Route path=":channel/:event" element={<PrintTemplateConfigPage />} />
          </Route>
        </Route>
      </Routes>
    </SettingsProvider>
  )
}
