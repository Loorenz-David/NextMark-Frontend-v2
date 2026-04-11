import { LocalDeliveryEditFormFields } from './LocalDeliveryEditFormFields'
import { LocalDeliveryEditFormFooter } from './LocalDeliveryEditFormFooter'

export const LocalDeliveryEditFormForm = ({
  includePlanMeta = true,
}: {
  includePlanMeta?: boolean
}) => {
  return (
    <div className="relative h-full w-full">
      <LocalDeliveryEditFormFields includePlanMeta={includePlanMeta} />
      <LocalDeliveryEditFormFooter />
    </div>
  )
}
