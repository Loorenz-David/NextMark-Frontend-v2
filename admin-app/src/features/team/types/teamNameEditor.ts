export type TeamNameEditor = {
  isEditing: boolean
  draftName: string
  startEdit: () => void
  cancelEdit: () => void
  updateDraft: (value: string) => void
  confirmEdit: () => Promise<void>
}
