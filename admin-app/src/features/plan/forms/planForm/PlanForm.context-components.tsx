import type { ReactNode } from 'react'
import type { PropsPlanFormContext } from './PlanForm.types'
export type PanFormContextProvider =  {
    children: ReactNode,
    value: PropsPlanFormContext
}
import { PlanFormContext } from './PlanForm.context'

export const PlanFormContextProvider = ({value, children}: PanFormContextProvider)=>{

    return (
        <PlanFormContext.Provider value={value}>
            {children}
        </PlanFormContext.Provider>
    )
}
