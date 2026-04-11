import type { StackComponentProps } from '@/shared/stack-manager/types'
import { MailIcon } from '@/assets/icons'

import { TeamProvider } from '../context/TeamProvider'
import { useTeamInvitationsFlow } from '../hooks/useTeamInvitationsFlow'
import { useTeamInvitationActions } from '../hooks/useTeamInvitationActions'
import { useTeamInvitesReceived, useTeamInvitesSent } from '../invitations/hooks/useTeamInvitationSelectors'

import { TeamInvitationsSection } from '../components/TeamInvitationsSection'

const TeamInvitationsPageContent = () => {

  useTeamInvitationsFlow()

  const invitesReceived = useTeamInvitesReceived()
  const invitesSent = useTeamInvitesSent()
  const { acceptInvitation, rejectInvitation } = useTeamInvitationActions()

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-52 translate-x-6 -translate-y-8 rounded-full bg-[rgb(var(--color-light-blue-r),0.1)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <MailIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Team Settings
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Invitations
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Review pending team invitations, accept incoming requests, and track invitations you have sent.
            </p>
          </div>
        </div>
      </section>

      <TeamInvitationsSection
        invitesReceived={invitesReceived}
        invitesSent={invitesSent}
        onAccept={acceptInvitation}
        onReject={rejectInvitation}
      />
    </div>
  )
}

export const TeamInvitationsPage = (_: StackComponentProps<undefined>) => (
  <TeamProvider>
    <TeamInvitationsPageContent />
  </TeamProvider>
)
