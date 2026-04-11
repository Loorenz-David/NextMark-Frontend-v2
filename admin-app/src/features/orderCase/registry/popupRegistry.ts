export const popupRegistry = {} as const

export type OrderCasePopupKey = keyof typeof popupRegistry
export type OrderCasePopupPayloads = Record<never, never>
