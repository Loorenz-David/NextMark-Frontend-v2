import { BoldCheckIcon, CloseIcon, EditIcon } from '@/assets/icons'

import type { TeamNameEditor } from '@/features/team/types/teamNameEditor'

type TeamNameEditorRowProps = {
  teamName: string | null
  teamNameEditor: TeamNameEditor
}

export const TeamNameEditorRow = ({
  teamName,
  teamNameEditor,
}: TeamNameEditorRowProps) => {
  if (!teamName) return null

  const {
    isEditing,
    draftName,
    startEdit,
    cancelEdit,
    updateDraft,
    confirmEdit,
  } = teamNameEditor

  return (
    <div className="flex items-center gap-2 pt-1">
      {isEditing ? (
        <>
          <input
            className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none"
            value={draftName}
            onChange={(event) => updateDraft(event.target.value)}
            placeholder="Team name"
          />
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.12)] text-[rgb(var(--color-light-blue-r))]"
            onClick={confirmEdit}
            type="button"
            aria-label="Confirm team name"
          >
            <BoldCheckIcon className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-[var(--color-muted)]"
            onClick={cancelEdit}
            type="button"
            aria-label="Cancel team name edit"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <p className="rounded-full border border-[rgb(var(--color-light-blue-r),0.26)] bg-[rgb(var(--color-light-blue-r),0.12)] px-3 py-1 text-xs text-[rgb(var(--color-light-blue-r))]">
            Team: {teamName}
          </p>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-[var(--color-muted)]"
            onClick={startEdit}
            type="button"
            aria-label="Edit team name"
          >
            <EditIcon className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
