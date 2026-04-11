import { useState } from 'react'
import type{ PayloadBase } from '../types/types'
import type { BaseControls } from '@/shared/resource-manager/types'

export const useBaseControlls = <T,>(): BaseControls<T> => {

    const [ isBaseOpen, setIsBaseOpen ] = useState(false)
    const [ payload, setPayload ] = useState<T | null>(null)


    const openBase =  ({payload}:{payload:T})=>{
        setIsBaseOpen(true)
    
        setPayload(payload)
    }
    const closeBase = ()=>{
        setIsBaseOpen(false)
        setPayload(null)
    }
    

    return {
        isBaseOpen,
        payload,
        openBase,
        closeBase,
        setBasePayload: setPayload
    }


}




export const usePayloadBaseControlls = () =>
  useBaseControlls<PayloadBase>()
