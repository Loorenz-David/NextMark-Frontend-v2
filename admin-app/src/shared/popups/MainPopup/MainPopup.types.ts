import type { ReactNode } from 'react'
import type {PopupLayoutVariant} from './MainPopupVariant.map'

export type PropsHeaderConfig = {
    label?: string,
    description?: string | ReactNode,
    excludeHeader?: boolean
    icon?: ReactNode
}


export type parentParams ={
    controllBodyLayout?: boolean
    layoutVariant?: PopupLayoutVariant
    autoHeight?: boolean
}

export type FooterButton = {
    label: string
    action?: ()=>void
    actionKey?: string
}

export type PropsFooterConfig = {
    saveButton?: FooterButton
    deleteButton?: FooterButton
}

