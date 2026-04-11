import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'

import { useLocalDeliveryEditForm } from '../LocalDeliveryEditForm.context'

export const LocalDeliveryEditFormPlanLabelField = () => {
  const { formState, formSetters } = useLocalDeliveryEditForm()

  return (
    <Field label="Plan label:">
      <InputField value={formState.delivery_plan.label} onChange={formSetters.handlePlanLabel} />
    </Field>
  )
}
