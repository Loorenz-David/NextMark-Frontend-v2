import { useMemo, useState } from 'react'

import { ObjectLinkSelector } from '@/shared/inputs/ObjectLinkSelector'

import { useTeamMemberByServerId } from '../../hooks/useTeamMemberSelectors'
import { useTeamMemberStoreQuery } from '../../hooks/useTeamMemberStoreQuery'
import { MemberAvatar } from '../MemberAvatar'

import type { MemberSelectorProps } from './MemberSelector.types'

export const MemberSelector = ({ selectedMember, onSelectMember }: MemberSelectorProps) => {
  const [query, setQuery] = useState('')
  const selectedTeamMember = useTeamMemberByServerId(selectedMember)
  const members = useTeamMemberStoreQuery(query)

  const selectedItems = useMemo(
    () =>
      selectedTeamMember
        ? [
            {
              id: selectedTeamMember.id,
              label: selectedTeamMember.username,
              details: selectedTeamMember.email,
              icon: <MemberAvatar username={selectedTeamMember.username} className="mr-0" />,
            },
          ]
        : [],
    [selectedTeamMember],
  )

  const options = useMemo(
    () =>
      members.map((member) => ({
        id: member.id,
        label: member.username,
        details: member.email,
        icon: <MemberAvatar username={member.username} className="mr-0" />,
      })),
    [members],
  )

  return (
    <ObjectLinkSelector
      mode="single"
      options={options}
      selectedItems={selectedItems}
      queryValue={query}
      onQueryChange={setQuery}
      onSelectItem={(item) => onSelectMember(Number(item.id))}
      onRemoveSelectedItem={() => {
        setQuery('')
        onSelectMember(null)
      }}
      placeholder="Select a member"
      emptyOptionsMessage="No members found."
      emptySelectedMessage="No selected member."
      selectedOverlayTitle="Selected member"
      selectedButtonLabel="Member"
    />
  )
}
