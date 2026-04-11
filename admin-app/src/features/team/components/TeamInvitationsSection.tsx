import type { TeamInviteReceived, TeamInviteSent } from '@/features/team/invitations/types/teamInvitation'

import { TeamInvitationCard } from './TeamInvitationCard'

type TeamInvitationsSectionProps = {
  invitesReceived: TeamInviteReceived[]
  invitesSent: TeamInviteSent[]
  onAccept: (inviteId: number) => void
  onReject: (inviteId: number) => void
}

export const TeamInvitationsSection = ({
  invitesReceived,
  invitesSent,
  onAccept,
  onReject,
}: TeamInvitationsSectionProps) => {
 
  return(
  <section className="admin-glass-panel-strong flex flex-col gap-8 rounded-[28px] p-6 shadow-none">
    <div className="border-b border-[var(--color-border)]/70 pb-6">
      <h2 className="text-base font-semibold text-[var(--color-text)]">Invitations</h2>
      <p className="text-xs text-[var(--color-muted)]">Pending invites for your team.</p>
    </div>

    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Received
        </h3>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-text)]">
          {invitesReceived.length}
        </span>
      </div>
      {invitesReceived.map((invite) => (
        <TeamInvitationCard
          key={invite.client_id}
          invite={invite}
          variant="received"
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
      
      {!invitesReceived.length ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.03] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
          No received invitations.
        </div>
      ) : null}
    </div>

    <div className="flex flex-col gap-3 ">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Sent
        </h3>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-text)]">
          {invitesSent.length}
        </span>
      </div>
      {invitesSent.map((invite) => (
        <TeamInvitationCard
          key={invite.client_id}
          invite={invite}
          variant="sent"
        />
      ))}
      {!invitesSent.length ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.03] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
          No sent invitations.
        </div>
      ) : null}
    </div>
  </section>
)}
