import { createContext, createElement, useContext } from 'react'
import type { ReactNode } from 'react'

import type { ItemFormContextValue } from './ItemForm.types'

export const ItemFormContext = createContext<ItemFormContextValue | null>(null)

export const ItemFormContextProvider = ({
  value,
  children,
}: {
  value: ItemFormContextValue
  children: ReactNode
}) => createElement(ItemFormContext.Provider, { value }, children)

export const useItemForm = () => {
  const context = useContext(ItemFormContext)
  if (!context) {
    throw new Error('ItemFormContext is not available. Wrap your app with ItemFormProvider.')
  }
  return context
}
