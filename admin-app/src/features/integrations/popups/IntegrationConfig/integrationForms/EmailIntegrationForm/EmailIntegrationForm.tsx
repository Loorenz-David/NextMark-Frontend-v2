
import { InputField } from "@/shared/inputs/InputField"
import type { InitialFormState, IntegrationConfigSetters } from "../../IntegrationConfig.types"
import { Field } from "@/shared/inputs/FieldContainer"
import { Switch } from "@/shared/inputs/Switch"
import { AccordionSection } from "@/shared/layout/AccordionSection"
import { CustomInstructions } from "@/shared/layout/CustomInstructions"
import { SelectInputWithPopover } from "@/shared/inputs/SelectInputWithPopover"
import { getSmtpPasswordInstructions } from "./smtpPasswordInstructions"
import { SMTP_CUSTOM_NO_MATCH_MESSAGE, SMTP_PROVIDER_OPTIONS } from "./smtpProviderOptions"



type IntegrationFormProps = {
  formSetters : IntegrationConfigSetters['email'],
  formState : InitialFormState['email']
}

export const EmailIntegrationForm = ({
    formSetters,
    formState 
}: IntegrationFormProps) => {
    formSetters
    formState 

    return ( 
        <div className="flex flex-col gap-4 pb-20">
            <Field label="SMTP Server" required>
                <SelectInputWithPopover
                    options={SMTP_PROVIDER_OPTIONS}
                    selectionMode="single"
                    value={formState.smtp_server ?? ''}
                    onChange={(value)=>{formSetters.handleEmailKeyInput(value, 'smtp_server')}}
                    allowCustomInput={true}
                    displayMode="label-value"
                    noMatchMessage={SMTP_CUSTOM_NO_MATCH_MESSAGE}
                    placeholder="Select or type SMTP server"
                />
            </Field>
            <Field label="SMTP Username" required>
                <InputField
                    value={formState.smtp_username ?? ''}
                    onChange={(e)=>{formSetters.handleEmailKeyInput(e.target.value, 'smtp_username')}}
                />
            </Field>
            <Field label="SMTP Password" required>
                <InputField
                    value={formState.smtp_password ?? ''}
                    onChange={(e)=>{formSetters.handleEmailKeyInput(e.target.value, 'smtp_password')}}
                />
            </Field>
            <CustomInstructions
                steps={getSmtpPasswordInstructions(formState.smtp_server ?? '')}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                stepCardClassName="min-w-[320px]"
                stepCardMaxWidth={360}
                scrollable={true}

            />

            <div className="flex items-center pt-4">
                <AccordionSection title="Advanced Settings">
                    <Field label="SMTP Port">
                        <InputField
                            type="number"
                            value={String(formState.smtp_port ?? '')}
                            onChange={(e)=>{formSetters.handleEmailKeyInput(e.target.value, 'smtp_port')}}
                        />
                    </Field>
                
                    <Field label="Use TLS">
                        <Switch
                            value={formState.use_tls ?? false}
                            onChange={(value)=>{formSetters.handleEmailKeyInput(value, 'use_tls')}}
                        />
                    </Field>
                    <Field label="Use SSL">
                        <Switch
                            value={formState.use_ssl ?? false}
                            onChange={(value)=>{formSetters.handleEmailKeyInput(value, 'use_ssl')}}
                        />
                    </Field>
                </AccordionSection>
            </div>
        </div>
    );
}
