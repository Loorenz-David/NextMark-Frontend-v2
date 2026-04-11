import { useContext, createContext } from 'react'
import type { ReactNode } from 'react'
import type { PropsPlanFormContext } from './PlanForm.types'


export type PanFormContextProvider =  {
    children: ReactNode,
    value: PropsPlanFormContext
}

export const PlanFormContext = createContext< PropsPlanFormContext | null >( null )

export const PlanFormContextProvider = ({value, children}: PanFormContextProvider)=>{

    return (
        <PlanFormContext.Provider value={value}>
            {children}
        </PlanFormContext.Provider>
    )
}

export const usePlanForm = ()=>{
    const ctx = useContext( PlanFormContext )
    if( !ctx ){
        throw new Error("PlanForm is not available. Wrap your app with PlanFormProvider.")
    }
    return ctx
}