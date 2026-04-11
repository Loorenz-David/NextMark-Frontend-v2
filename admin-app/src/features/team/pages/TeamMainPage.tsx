import {useEffect} from 'react'
import type { StackComponentProps } from '@/shared/stack-manager/types'
import { UsersIcon } from '@/assets/icons'

import { TeamProvider } from '../context/TeamProvider'

import { useTeamMemberActions } from '../hooks/useTeamMemberActions'
import { useTeamMemberMeta } from '../hooks/useTeamMemberMeta'
import { useTeamNameEditor } from '../hooks/useTeamNameEditor'
import { filterTeamMembers } from '../domain/useTeamMemberRules'
import type { TeamMemberFilterKey } from '../types/teamMemberFilters'
import { useTeamMembers } from '../members/hooks/useTeamMemberSelectors'

import type { SearchBarValue } from '@/shared/buttons/SearchBar'

import { TeamMembersSection } from '../components/TeamMembersSection'
import { useTeamMembersFlow } from '../hooks/useTeamMembersFlow'

const TeamMainPageContent = () => {

  const members = useTeamMembers()
  const { openInvitePopup, kickMember, leaveCurrentTeam, canKickMember } = useTeamMemberActions()
  const { teamName } = useTeamMemberMeta()
  const teamNameEditor = useTeamNameEditor(teamName)
  const { loadMembers } = useTeamMembersFlow()
  const handleSearch = (value: SearchBarValue) => {
    const filterKeys = value.filters as TeamMemberFilterKey[]
    const filtered = filterTeamMembers(members, value.input, filterKeys)
    return filtered
  }

  useEffect(()=>{
    loadMembers()
  },[])

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <UsersIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Team Settings
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Team members
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Manage who has access to your workspace, update the team name, and control member roles.
            </p>
          </div>
        </div>
      </section>

      <TeamMembersSection
        members={members}
        onInvite={openInvitePopup}
        onSearch={handleSearch}
        onKick={kickMember}
        onLeave={leaveCurrentTeam}
        canKickMember={canKickMember}
        teamName={teamName}
        teamNameEditor={teamNameEditor}
      />
    </div>
  )
}

export const TeamMainPage = (_: StackComponentProps<undefined>) => (
  <TeamProvider>
    <TeamMainPageContent />
  </TeamProvider>
)
