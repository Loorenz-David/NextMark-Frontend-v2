import { createContext, useContext } from 'react'
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

export const PopupContext = createContext<PropsPopupContext | null>(null)

interface PropsPopupContextProvider{
    value: PropsPopupContext,
    children: ReactNode
}
export const PopupContextProvider = ({value, children}: PropsPopupContextProvider) =>{
    return <PopupContext.Provider value={value} > {children} </PopupContext.Provider>
}

export const usePopupContext = ()=>{
    const ctx = useContext( PopupContext )
    if (!ctx){
        throw new Error("PopupContext is not available. Wrap your app with PopupContextProvider.")
    }
    return ctx
}