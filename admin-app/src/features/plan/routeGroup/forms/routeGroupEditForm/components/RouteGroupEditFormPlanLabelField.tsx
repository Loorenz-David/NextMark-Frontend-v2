import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'

import { useRouteGroupEditForm } from '../RouteGroupEditForm.context'

export const RouteGroupEditFormPlanLabelField = () => {
  const { formState, formSetters } = useRouteGroupEditForm()

  return (
    <Field label="Plan label:">
      <InputField value={formState.delivery_plan.label} onChange={formSetters.handlePlanLabel} />
    </Field>
  )
}
