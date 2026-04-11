import { createContext, useContext } from 'react'
import type { OrderCase } from '../../types'
import type { useCaseOrderActions } from '../../pages/order/order.actions'
import type { OrderCaseStats } from '../../types/orderCaseMeta'



export type CaseOrderContextValue ={
    cases: OrderCase[]
    casesStats?: OrderCaseStats
    caseOrderActions: ReturnType<typeof useCaseOrderActions>
}





export const CaseOrderContext = createContext<CaseOrderContextValue | null >(null)

export const useCaseOrderContext = ()=>{
    const ctx = useContext(CaseOrderContext)

    if(!ctx){
        throw new Error("CaseOrderContext must be used with in CaseOrderContextProvider")
    }

    return ctx
}