import { useMobile } from '@/app/contexts/MobileContext'
import type { ReactNode } from 'react'
import { usePopupContext } from './PopupContext'

type PropsPopupBody = {
  children: ReactNode
}
export const PopupBody = ({children}: PropsPopupBody) => {
    const isMobile = useMobile()
    const { parentParams } = usePopupContext()
    return ( 
        <div className={`${parentParams?.autoHeight ? 'relative overflow-visible' : 'flex-1 h-full relative overflow-hidden'} ${isMobile ? 'py-5 px-2' : ' px-3 py-5'}`}>
            {children}
        </div>
    );
}
