
import { InputField } from "@/shared/inputs/InputField"
import type { InitialFormState, IntegrationConfigSetters } from "../../IntegrationConfig.types"
import { Field } from "@/shared/inputs/FieldContainer"
import { CustomInstructions } from "@/shared/layout/CustomInstructions"
import { getTwilioSetupInstructions } from "./twilioInstructions"




type IntegrationFormProps = {
  formSetters : IntegrationConfigSetters['twilio'],
  formState : InitialFormState['twilio']
}

export const TwilioIntegrationForm = ({
    formSetters,
    formState 
}: IntegrationFormProps) => {
    formSetters
    formState 

    return ( 
        <div className="flex flex-col gap-4 pb-20">
            <Field label="Twilio Account SID">
                <InputField
                    value={formState.twilio_account_sid ?? ''}
                    onChange={(e)=>{formSetters.handleTwilioKeyInput(e.target.value, 'twilio_account_sid')}}
                />
            </Field>
            <Field label="Twilio Api Key SID">
                <InputField
                    value={formState.twilio_api_key_sid ?? ''}
                    onChange={(e)=>{formSetters.handleTwilioKeyInput(e.target.value, 'twilio_api_key_sid')}}
                />
            </Field>
            <Field label="Twilio Secret Key">
                <InputField
                    value={formState.twilio_api_key_secret ?? ''}
                    onChange={(e)=>{formSetters.handleTwilioKeyInput(e.target.value, 'twilio_api_key_secret')}}
                />
            </Field>
            <Field label="Twilio Phone Number   ">
                <InputField
                    type="number"
                    value={String(formState.sender_number ?? '')}
                    onChange={(e)=>{formSetters.handleTwilioKeyInput(e.target.value, 'sender_number')}}
                />
            </Field>
            <CustomInstructions
                steps={getTwilioSetupInstructions()}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                stepCardClassName="min-w-[320px]"
                stepCardMaxWidth={360}
                scrollable={true}
            />
        </div>
    );
}
