import type { ReactNode } from 'react'
import type { parentParams, PropsHeaderConfig } from './MainPopup.types'
export type PropsPopupContext = {
    headerConfig : PropsHeaderConfig | null
    closeState: 'idle' | 'confirming'
    setPopupHeader : (config: PropsHeaderConfig | null) => void
    confirmBeforeClosing: (()=> boolean ) | null
    registerCloseGuard : (fn: ()=>boolean )=> void
    clearCloseGuard : ()=> void
    closePopup : ()=> void
    confirmClose: ()=> void,
    cancelClose: ()=> void,
    parentParams?: parentParams
}
interface PropsPopupContextProvider{
    value: PropsPopupContext,
    children: ReactNode
}
import { PopupContext } from './PopupContext'

export const PopupContextProvider = ({value, children}: PropsPopupContextProvider) =>{
    return <PopupContext.Provider value={value} > {children} </PopupContext.Provider>
}
