import type { Dispatch, SetStateAction } from 'react'

export interface BaseControls<TPayload = unknown> {
  isBaseOpen: boolean
  payload: TPayload | null
  openBase: ({ payload }: { payload: TPayload }) => void
  closeBase: () => void
  setBasePayload: Dispatch<SetStateAction<TPayload | null>>
}
