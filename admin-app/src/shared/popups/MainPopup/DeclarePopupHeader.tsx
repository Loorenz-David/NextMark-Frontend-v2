import { useEffect } from 'react'
import { usePopupContext } from './PopupContext'
import type { PropsHeaderConfig } from './MainPopup.types'

interface PropsPopupHeader {
    config: PropsHeaderConfig
}

export const DeclarePopupHeader = ({config}: PropsPopupHeader) =>{
    const { setPopupHeader } = usePopupContext()

    useEffect(()=>{
        setPopupHeader(config)
    },[config])

    return null
}