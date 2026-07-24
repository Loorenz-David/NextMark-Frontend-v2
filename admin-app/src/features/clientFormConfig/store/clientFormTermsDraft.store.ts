import { create } from 'zustand'

import type { Descendant } from 'slate'

/**
 * The in-progress terms document, held outside the page so switching tabs never
 * discards unsaved legal text. `draft === null` means "not seeded yet" — the
 * controller seeds it once from the live version when history first loads.
 */
type ClientFormTermsDraftState = {
  draft: Descendant[] | null
  /** Bumped whenever the draft is replaced wholesale; Slate reads `initialValue` once. */
  editorKey: number
  sourceVersionId: number | null
  setDraft: (value: Descendant[]) => void
  replaceDraft: (value: Descendant[], sourceVersionId: number | null) => void
  setSourceVersionId: (versionId: number | null) => void
  reset: () => void
}

export const useClientFormTermsDraftStore = create<ClientFormTermsDraftState>((set) => ({
  draft: null,
  editorKey: 0,
  sourceVersionId: null,

  setDraft: (value) => set(() => ({ draft: value })),

  replaceDraft: (value, sourceVersionId) =>
    set((state) => ({ draft: value, sourceVersionId, editorKey: state.editorKey + 1 })),

  setSourceVersionId: (versionId) => set(() => ({ sourceVersionId: versionId })),

  reset: () => set(() => ({ draft: null, editorKey: 0, sourceVersionId: null })),
}))
