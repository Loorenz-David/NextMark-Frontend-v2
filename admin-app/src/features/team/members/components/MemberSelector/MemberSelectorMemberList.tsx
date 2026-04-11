
import { MemberSelectorMemberCard } from './MemberSelectorMemberCard'
import { useMemberSelectorContext } from './MemberSelector.context'

export const MemberSelectorMemberList = () => {
  const { members, handleSelectMember, selectedMemberId } = useMemberSelectorContext()


  if (!members.length) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--color-muted)]">
        No members found.
      </div>
    )
  }

  return (
    <ul>
      {members.map((teamMember) => {
        const isSelected = teamMember.id === selectedMemberId
        return (
          <MemberSelectorMemberCard
            key={`member-${teamMember.id}`}
            teamMember={teamMember}
            isSelected={isSelected}
            onSelectMember={handleSelectMember}
          />
        )
      })}
    </ul>
  )
}
