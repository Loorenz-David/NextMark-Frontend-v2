import { useMobile } from '@/app/viewport'
import { Navigate, Route, Routes } from 'react-router-dom'

import { PrintTemplateChannelPage } from '@/features/templates/printDocument/pages/PrintTemplateChannelPage'
import { PrintTemplateConfigPage } from '@/features/templates/printDocument/pages/PrintTemplateConfigPage'
import { SettingsProvider } from '../context/SettingsProvider'
import { SettingsOverlays } from '../components/SettingsOverlays'
import { sectionRegistry } from '../registry/sectionRegistry'
import { SettingsDesktopView } from '../views/SettingsDesktopView'
import { SettingsMobileView } from '../views/SettingsMobileView'
import { SettingsMobileSectionList } from '../components/mobile/SettingsMobileSectionList'

const SettingsView = () => {
  const { isMobile } = useMobile()

  return (
    <div
      className={`overflow-hidden bg-[var(--color-page)] text-[var(--color-text)] ${
        isMobile ? 'h-dvh' : 'h-screen'
      }`}
    >
      <SettingsOverlays />
      <div className="flex h-full w-screen flex-col overflow-hidden">
        {isMobile ? <SettingsMobileView /> : <SettingsDesktopView />}
      </div>
    </div>
  )
}

/** Desktop lands on the profile; the phone shows the section list instead. */
const SettingsIndexRoute = () => {
  const { isMobile } = useMobile()
  return isMobile ? <SettingsMobileSectionList /> : <Navigate to="profile" replace />
}

export const SettingsPage = () => {
  const UserMain = sectionRegistry['user.main']
  const TeamMain = sectionRegistry['team.main']
  const TeamInvitations = sectionRegistry['team.invitations']
  const IntegrationsMain = sectionRegistry['integrations.main']
  const IntegrationStatusMain = sectionRegistry['integrations.status']
  const MessagesMain = sectionRegistry['messages.main']
  const ItemsMain = sectionRegistry['item.main']
  const VehiclesMain = sectionRegistry['vehicle.main']
  const FacilitiesMain = sectionRegistry['facility.main']
  const TrustedDevicesMain = sectionRegistry['trustedDevice.main']
  const PrintDocumentMain = sectionRegistry['printDocument.main']
  const ExternalFormAccess = sectionRegistry['externalForm.access']
  const ExternalFormConfig = sectionRegistry['externalForm.formConfig']

  return (
    <SettingsProvider>
      <Routes>
        <Route element={<SettingsView />}>
          <Route index element={<SettingsIndexRoute />} />
          <Route path="profile" element={<UserMain />} />
          <Route path="team" element={<TeamMain />} />
          <Route path="team/invitations" element={<TeamInvitations />} />
          <Route path="integrations" element={<IntegrationsMain />} />
          <Route path="integrations/status" element={<IntegrationStatusMain />} />
          <Route path="messages" element={<MessagesMain />} />
          <Route path="items" element={<ItemsMain />} />
          <Route path="vehicles" element={<VehiclesMain />} />
          <Route path="facilities" element={<FacilitiesMain />} />
          <Route path="trusted-devices" element={<TrustedDevicesMain />} />
          <Route path="external-form" element={<ExternalFormAccess />} />
          <Route path="external-form/configuration" element={<ExternalFormConfig />} />
          <Route path="print-templates" element={<PrintDocumentMain />}>
            <Route path=":channel" element={<PrintTemplateChannelPage />} />
            <Route path=":channel/:event" element={<PrintTemplateConfigPage />} />
          </Route>
        </Route>
      </Routes>
    </SettingsProvider>
  )
}
