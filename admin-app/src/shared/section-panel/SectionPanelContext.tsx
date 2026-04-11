import {useContext, createContext, type ReactNode} from 'react'

export type SectionHeaderAction = {
    label: string
    value: string
    icon?: ReactNode
    action?: (item: SectionHeaderAction) => void
}

export type SectionHeaderConfig = {
    icon?: ReactNode
    title?: ReactNode

    actions?: SectionHeaderAction[]
    buttons?: React.ReactNode[]
    closeButton?:boolean
    customHeaderButton?:ReactNode
    DotMenuActions?:boolean
    headerButtonsBgClass?: string
}

type SectionPanelContextValue = {
  setHeader: (config: SectionHeaderConfig | null) => void
  onClose:()=>void
}

export const SectionPanelContext =
  createContext<SectionPanelContextValue | null>(null)

export const useSectionPanel = () => {
  const ctx = useContext(SectionPanelContext)
  if (!ctx) {
    throw new Error('useSectionPanel must be used inside SectionPanel')
  }
  return ctx
}
