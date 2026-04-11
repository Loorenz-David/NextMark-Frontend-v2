import { createContext, useContext } from 'react'
import type { OrderCase } from '../../types'
import type { useCaseMainActions } from '../../pages/main/main.actions'
import type { useOrderCaseQuery } from '../../store/orderCaseQueryStore'
import type { OrderCaseStats } from '../../types/orderCaseMeta'


export type CaseMainContextValue ={
    cases: OrderCase[]
    casesStats?:OrderCaseStats
    caseMainActions: ReturnType<typeof useCaseMainActions>
    query: ReturnType<typeof useOrderCaseQuery>
}





export const CaseMainContext = createContext<CaseMainContextValue | null >(null)

export const useCaseMainContext = ()=>{
    const ctx = useContext(CaseMainContext)

    if(!ctx){
        throw new Error("CaseMainContext must be used with in CaseMainContextProvider")
    }

    return ctx
}