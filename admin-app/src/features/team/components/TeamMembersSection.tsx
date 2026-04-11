import { useEffect, useState } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { SearchBar, type SearchBarValue } from '@/shared/buttons/SearchBar'

import type { TeamMember } from '@/features/team/members/types/teamMember'
import type { TeamNameEditor } from '@/features/team/types/teamNameEditor'

import { TeamMemberCard } from './TeamMemberCard'
import { TeamNameEditorRow } from './TeamNameEditorRow'

type TeamMembersSectionProps = {
  members: TeamMember[]
  onInvite: () => void
  onSearch: (value: SearchBarValue) => TeamMember[]
  onKick: (id: number) => void
  onLeave: () => void
  canKickMember: (id: number | null | undefined) => boolean
  teamName: string | null
  teamNameEditor: TeamNameEditor
}

const FILTER_OPTIONS = [
  { label: 'Username', value: 'username' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone_number' },
]

export const TeamMembersSection = ({
  members,
  onInvite,
  onSearch,
  onKick,
  onLeave,
  canKickMember,
  teamName,
  teamNameEditor,
}: TeamMembersSectionProps) => {
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>(members)
  useEffect(() => {
    setFilteredMembers(members)
  }, [members])

  const handleSearchChange = (value: SearchBarValue) => {
    setFilteredMembers(onSearch(value))
  }

  return (
    <section className="admin-glass-panel-strong flex h-full flex-col overflow-hidden rounded-[28px] shadow-none">
      <div className="flex flex-col gap-5 border-b border-[var(--color-border)]/70 px-6 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">Members</h2>
              <p className="text-xs text-[var(--color-muted)]">Manage your team members.</p>
            </div>
            <TeamNameEditorRow teamName={teamName} teamNameEditor={teamNameEditor} />
          </div>
          <div className="flex items-center gap-4">
            <BasicButton
              params={{
                onClick: onLeave,
                variant: 'secondary',
              }}
            >
              Leave team
            </BasicButton>
            <BasicButton
              params={{
                onClick: onInvite,
                variant: 'primary',
              }}
            >
              + Invite
            </BasicButton>
          </div>
        </div>

        <SearchBar
          options={FILTER_OPTIONS}
          onChange={handleSearchChange}
          className="w-full rounded-2xl border border-[var(--color-border)]/70 bg-white/[0.04]"
          inputClassName="w-full  px-3 py-2 text-sm"
          iconClassName="p-2 pr-3 cursor-pointer"
          placeholder="Search for members"
        />
      </div>

      <div className="flex h-full flex-col gap-3 bg-[var(--color-page)]/30 p-6 pt-8">
        {filteredMembers.map((member) => (
          <TeamMemberCard
            key={member.client_id}
            member={member}
            onKick={onKick}
            showKick={canKickMember(member.id)}
          />
        ))}
        {!filteredMembers.length ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.03] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
            No members found.
          </div>
        ) : null}
      </div>
    </section>
  )
}
