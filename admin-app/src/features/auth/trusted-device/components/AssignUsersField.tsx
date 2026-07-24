import { useEffect, useMemo, useState } from 'react'

import { teamMemberApi } from '@/features/team/members/api/teamMemberApi'
import type { TeamMember } from '@/features/team/members/types/teamMember'
import { MemberAvatar } from '@/features/team/members/components/MemberAvatar'

const CheckMarkIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12.5 9.5 17 19 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
    />
  </svg>
)

type AssignUsersFieldProps = {
  selectedClientIds: string[]
  onToggle: (clientId: string) => void
}

/**
 * Multi-select operator picker for device enrollment. Sources from the team
 * member list; emits the selected user `client_id`s that feed `user_client_ids`.
 * (The shared `MemberSelector` is single-select, so this is a dedicated checklist.)
 */
export const AssignUsersField = ({
  selectedClientIds,
  onToggle,
}: AssignUsersFieldProps) => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    teamMemberApi
      .listTeamMembers()
      .then((response) => {
        if (cancelled) {
          return
        }
        const table = response.data.team_members
        setMembers(
          table.allIds
            .map((id) => table.byClientId[id])
            .filter((member): member is TeamMember => Boolean(member)),
        )
      })
      .catch(() => {
        // Non-blocking: an empty picker still lets the admin create an unassigned device.
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(() => new Set(selectedClientIds), [selectedClientIds])

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[var(--color-muted)]">
        Operators served by this device
      </span>
      <div className="flex max-h-64 flex-col gap-2 overflow-auto scroll-thin">
        {isLoading ? (
          <p className="text-xs text-[var(--color-muted)]">Loading team members…</p>
        ) : null}
        {!isLoading && !members.length ? (
          <p className="text-xs text-[var(--color-muted)]">No team members found.</p>
        ) : null}
        {members.map((member) => {
          const isSelected = selected.has(member.client_id)
          return (
            <button
              key={member.client_id}
              type="button"
              onClick={() => onToggle(member.client_id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-info-border bg-[linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))] text-[var(--color-text)]'
                  : 'border-border bg-[var(--color-page)] text-muted hover:border-border-accent'
              }`}
            >
              <MemberAvatar username={member.username} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-[var(--color-text)]">
                  {member.username}
                </span>
                <span className="truncate text-xs text-[var(--color-muted)]">
                  {member.email}
                </span>
              </div>
              {isSelected ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-blue-500)_92%,transparent)] text-text">
                  <CheckMarkIcon className="h-3 w-3" />
                </span>
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border border-[rgba(147,197,253,0.72)]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
