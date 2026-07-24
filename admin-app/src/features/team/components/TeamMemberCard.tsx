import { useState } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { formatPhone } from '@/shared/data-validation/phoneValidation'
import { MemberAvatar } from '@/shared/layout/MemberAvatar'

import type { TeamMember } from '@/features/team/members/types/teamMember'
import { capitalize } from '@shared-utils'

type TeamMemberCardProps = {
  member: TeamMember
  onKick: (id: number) => void
  showKick: boolean
}

export const TeamMemberCard = ({ member, onKick, showKick }: TeamMemberCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-3xl border border-border bg-surface-raised px-5 py-4 shadow-none">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <MemberAvatar username={member.username} />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{capitalize(member.username)}</p>
            <p className="text-xs text-[var(--color-muted)]">Role ID: {member.user_role_id ?? '—'}</p>
          </div>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4 text-xs text-[var(--color-text)]">
          <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <span className="text-[var(--color-muted)]">Email</span>
            <span className="text-right">{member.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <span className="text-[var(--color-muted)]">Phone</span>
            <span className="text-right">
              {member.phone_number ? formatPhone(member.phone_number) : '—'}
            </span>
          </div>
          {showKick ? (
            <div className="pt-2">
              <BasicButton
                params={{
                  variant: 'secondary',
                  className: 'border-danger-border bg-danger-bg text-danger hover:bg-danger-bg',
                  onClick: () => {
                    if (member.id) {
                      onKick(member.id)
                    }
                  },
                }}
              >
                Kick from team
              </BasicButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
