import { useCallback, useEffect, useState } from 'react'

import { useTeamNameActions } from './useTeamNameActions'

type UseTeamNameEditorResult = {
  isEditing: boolean
  draftName: string
  startEdit: () => void
  cancelEdit: () => void
  updateDraft: (value: string) => void
  confirmEdit: () => Promise<void>
}

export const useTeamNameEditor = (teamName: string | null): UseTeamNameEditorResult => {
  const { updateTeamName } = useTeamNameActions()
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(teamName ?? '')

  useEffect(() => {
    if (!isEditing) {
      setDraftName(teamName ?? '')
    }
  }, [teamName, isEditing])

  const startEdit = useCallback(() => {
    setDraftName(teamName ?? '')
    setIsEditing(true)
  }, [teamName])

  const cancelEdit = useCallback(() => {
    setDraftName(teamName ?? '')
    setIsEditing(false)
  }, [teamName])

  const updateDraft = useCallback((value: string) => {
    setDraftName(value)
  }, [])

  const confirmEdit = useCallback(async () => {
    const nextName = draftName.trim()
    if (!nextName || nextName === (teamName ?? '')) {
      setIsEditing(false)
      return
    }

    const success = await updateTeamName(nextName)
    if (success) {
      setIsEditing(false)
    }
  }, [draftName, teamName, updateTeamName])

  return {
    isEditing,
    draftName,
    startEdit,
    cancelEdit,
    updateDraft,
    confirmEdit,
  }
}
