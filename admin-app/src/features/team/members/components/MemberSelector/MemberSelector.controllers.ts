import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import type { TeamMember } from '../../types/teamMember'
import { useTeamMemberByServerId } from '../../hooks/useTeamMemberSelectors'
import { useTeamMemberStoreQuery } from '../../hooks/useTeamMemberStoreQuery'

type MemberSelectorControllerProps = {
  selectedMemberId: number | null | undefined
  onSelectMember: (memberId: number | null) => void
}

export const useMemberSelectorControllers = ({
  selectedMemberId,
  onSelectMember,
}: MemberSelectorControllerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const skipCloseResetRef = useRef(false)
  const clearedSelectionRef = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const selectedMember = useTeamMemberByServerId(selectedMemberId)
  const members = useTeamMemberStoreQuery(inputValue)

  useEffect(() => {
    if (selectedMember) {
      setInputValue(selectedMember.username)
    }
  }, [selectedMember?.id, selectedMember?.username])

  const resetIfNoSelection = useCallback(() => {

    if (skipCloseResetRef.current) {
      skipCloseResetRef.current = false
      return
    }

    if (clearedSelectionRef.current) {

      clearedSelectionRef.current = false
      setInputValue('')
      onSelectMember(null)
      return
    }

    if (!selectedMemberId) {
      setInputValue('')
      onSelectMember(null)
    }
  }, [onSelectMember, selectedMemberId])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      
      setIsOpen(open)

      if (!open) {
        inputRef.current?.blur()
        resetIfNoSelection()
      }
    },
    [resetIfNoSelection],
  )

  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
  }, [])


  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setInputValue(value)
      setIsOpen(true)
      clearedSelectionRef.current = true
      onSelectMember(null)
    },
    [onSelectMember, selectedMemberId],
  )

  const handleSelectMember = useCallback(
    (member: TeamMember) => {
      skipCloseResetRef.current = true
      onSelectMember(member.id)
      setInputValue(member.username)
      
      requestAnimationFrame(() => {
        setIsOpen(false)
        inputRef.current?.blur()
      })
    },
    [onSelectMember],
  )

  return {
    inputRef,
    isOpen,
    inputValue,
    members,
    selectedMember: selectedMember ?? null,
    handleOpenChange,
    handleInputFocus,
    handleInputChange,
    handleSelectMember,
  }
}
