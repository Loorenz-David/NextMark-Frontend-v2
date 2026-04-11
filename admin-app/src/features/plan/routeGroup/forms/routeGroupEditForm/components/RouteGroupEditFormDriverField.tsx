import { MemberSelector } from '@/features/team/members/components'
import { Field } from '@/shared/inputs/FieldContainer'

import { useRouteGroupEditForm } from '../RouteGroupEditForm.context'
import { LOCAL_DELIVERY_DRIVER_INFO } from '../info/driver.info'

export const RouteGroupEditFormDriverField = () => {
  const { formState, formSetters } = useRouteGroupEditForm()

  return (
    <Field label="Driver:" info={LOCAL_DELIVERY_DRIVER_INFO}>
      <MemberSelector
        selectedMember={formState.route_solution.driver_id}
        onSelectMember={formSetters.handleDriverSelection}
      />
    </Field>
  )
}
