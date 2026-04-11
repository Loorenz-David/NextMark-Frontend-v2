import type { TeamInviteReceived, TeamInviteSent } from '@/features/team/invitations/types/teamInvitation'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { formatIsoDate } from '@/shared/utils/formatIsoDate'
import { capitalize } from '@shared-utils'

type TeamInvitationCardProps =
  | {
      invite: TeamInviteReceived
      variant: 'received'
      onAccept: (id: number) => void
      onReject: (id: number) => void
    }
  | {
      invite: TeamInviteSent
      variant: 'sent'
    }

export const TeamInvitationCard = (props: TeamInvitationCardProps) => {
  const { invite, variant } = props
  const inviteId = invite.id ?? null

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {variant === 'received'
              ? capitalize(invite.from_team_name ?? '')
              : invite.target_username}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{invite.user_role_name}</p>
        </div>
        {variant === 'received' ? (
          <div className="flex items-center gap-4">
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: () => {
                  if (inviteId) {
                    props.onReject(inviteId)
                  }
                },
              }}
            >
              Reject
            </BasicButton>
            <BasicButton
              params={{
                variant: 'primary',
                onClick: () => {
                  if (inviteId) {
                    props.onAccept(inviteId)
                  }
                },
              }}
            >
              Accept
            </BasicButton>
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        {formatIsoDate(invite.creation_date) ?? '—'}
      </p>
    </div>
  )
}
