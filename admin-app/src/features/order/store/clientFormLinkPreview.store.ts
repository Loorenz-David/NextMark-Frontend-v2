import { create } from 'zustand'

type ClientFormLinkPreview = {
  formUrl: string | null
  expiresAt: string | null
}

type ClientFormLinkPreviewState = {
  byOrderId: Record<number, ClientFormLinkPreview>
  setPreview: (orderId: number, preview: ClientFormLinkPreview) => void
  clearPreview: (orderId: number) => void
}

export const useClientFormLinkPreviewStore = create<ClientFormLinkPreviewState>((set) => ({
  byOrderId: {},
  setPreview: (orderId, preview) =>
    set((state) => ({
      byOrderId: {
        ...state.byOrderId,
        [orderId]: preview,
      },
    })),
  clearPreview: (orderId) =>
    set((state) => {
      const nextByOrderId = { ...state.byOrderId }
      delete nextByOrderId[orderId]
      return { byOrderId: nextByOrderId }
    }),
}))

export const useClientFormLinkPreview = (orderId: number | null | undefined) =>
  useClientFormLinkPreviewStore((state) =>
    typeof orderId === 'number' ? state.byOrderId[orderId] ?? null : null,
  )

export const getClientFormLinkPreview = (orderId: number | null | undefined) => {
  if (typeof orderId !== 'number') return null
  return useClientFormLinkPreviewStore.getState().byOrderId[orderId] ?? null
}

export const setClientFormLinkPreview = (
  orderId: number,
  preview: ClientFormLinkPreview,
) => useClientFormLinkPreviewStore.getState().setPreview(orderId, preview)
