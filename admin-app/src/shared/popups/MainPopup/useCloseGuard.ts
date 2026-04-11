import { useCallback, useMemo, useState } from "react"

interface PropsUseCloseGuard{
    onRequestClose: ()=>void
}

export const useCloseGuard = ({onRequestClose}: PropsUseCloseGuard)=>{
    const [ confirmBeforeClosing, setConfirmBeforeClosing ] = useState<(()=> boolean) | null > ( null )
    const [ closeState, setCloseState ] = useState<'idle' | 'confirming'>( 'idle' )

 
    const cancelClose = useCallback(()=>{
        setCloseState('idle')
    }, [])
    const confirmClose = useCallback(()=>{
        setCloseState( 'idle' )
        onRequestClose()
    }, [onRequestClose])

    const closePopup = useCallback(() =>{
        
        if ( !confirmBeforeClosing ){
            onRequestClose()
            return
        }
        if ( confirmBeforeClosing?.() ){
            onRequestClose()
            return
        }
        setCloseState('confirming')
    }, [confirmBeforeClosing, onRequestClose])

    const registerCloseGuard = useCallback((fn: ()=> boolean)=>{
        setConfirmBeforeClosing(() => fn)
        return ()=> setConfirmBeforeClosing( null )
    }, [])

    const clearCloseGuard = useCallback(()=>{
        setConfirmBeforeClosing(null)
    }, [])

    return useMemo(() => ({
        closeState,
        closePopup,
        registerCloseGuard,
        clearCloseGuard,
        confirmBeforeClosing,
        cancelClose,
        confirmClose,
    }), [
        cancelClose,
        clearCloseGuard,
        closePopup,
        closeState,
        confirmBeforeClosing,
        confirmClose,
        registerCloseGuard,
    ])
}
