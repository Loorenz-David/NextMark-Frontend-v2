import { RouteGroupEditFormFields } from './RouteGroupEditFormFields'
import { RouteGroupEditFormFooter } from './RouteGroupEditFormFooter'

export const RouteGroupEditFormForm = ({
  includePlanMeta = true,
}: {
  includePlanMeta?: boolean
}) => {
  return (
    <div className="relative h-full w-full">
      <RouteGroupEditFormFields includePlanMeta={includePlanMeta} />
      <RouteGroupEditFormFooter />
    </div>
  )
}
