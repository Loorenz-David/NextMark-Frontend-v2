
import { InputField } from "@/shared/inputs/InputField"
import type { InitialFormState, IntegrationConfigSetters } from "../IntegrationConfig.types"
import { Field } from "@/shared/inputs/FieldContainer"



type IntegrationFormProps = {
  formSetters : IntegrationConfigSetters['shopify'],
  formState : InitialFormState['shopify']
}

export const ShopifyIntegrationForm = ({
    formSetters,
    formState 
}: IntegrationFormProps) => {
    formSetters
    formState 

    return ( 
        <div className="flex flex-col items-center justify-center h-full ">
            {/* <Field label="Shop name:">
                <InputField
                    value={formState.shop ?? ''}
                    onChange={(e)=>{formSetters.handleShopInput(e.target.value)}}
                />
            </Field> */}
            Waiting for Shopify approval
        </div>
    );
}