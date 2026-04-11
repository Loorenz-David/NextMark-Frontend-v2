import type { TeamMember } from '../../types/teamMember'
import { MemberAvatar } from '../MemberAvatar'

type MemberSelectorMemberCardProps = {
  teamMember: TeamMember
  onSelectMember: (member: TeamMember) => void
  isSelected: boolean
}

export const MemberSelectorMemberCard = ({
  teamMember,
  isSelected,
  onSelectMember,
}: MemberSelectorMemberCardProps) => {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.08]"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelectMember(teamMember)}
      >
        <MemberAvatar username={teamMember.username} className={'mr-3'}/>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--color-text)]">{teamMember.username}</span>
          <span className="text-xs text-[var(--color-muted)]">{teamMember.email}</span>
        </div>
        {isSelected && (
          <div className="ml-auto h-2 w-2 rounded-full bg-green-600" />
        )}
      </button>
    </li>
  )
}
