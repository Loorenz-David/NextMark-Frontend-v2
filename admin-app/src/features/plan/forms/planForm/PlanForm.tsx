import { PlanFormLayout } from './PlanForm.layout'
import { PlanFormProvider } from './PlanForm.provider'
import type { PopupPayload } from './PlanForm.types'



export const PlanFormFeature = ({
    payload,
    onSuccessClose,
    onUnsavedChangesChange,
}: {
    payload?: PopupPayload
    onSuccessClose?: () => void | Promise<void>
    onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}) => {
    
    return ( 
        <PlanFormProvider
            payload={payload}
            onSuccessClose={onSuccessClose}
            onUnsavedChangesChange={onUnsavedChangesChange}
        >
            <PlanFormLayout/>
        </PlanFormProvider>
    );
}
