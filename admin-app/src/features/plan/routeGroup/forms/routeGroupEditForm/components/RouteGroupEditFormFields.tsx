import { motion } from 'framer-motion'

import { RouteGroupEditFormCreateVariantToggle } from './RouteGroupEditFormCreateVariantToggle'
import { RouteGroupEditFormDriverField } from './RouteGroupEditFormDriverField'
import { RouteGroupEditFormPlanLabelField } from './RouteGroupEditFormPlanLabelField'
import { RouteGroupEditFormRouteSections } from './RouteGroupEditFormRouteSections'
import { RouteGroupEditFormStopsServiceTimeField } from './RouteGroupEditFormStopsServiceTimeField'

export const RouteGroupEditFormFields = ({
  includePlanMeta = true,
}: {
  includePlanMeta?: boolean
}) => {
  return (
    <motion.form
      layout
      className="flex h-full flex-col gap-7 overflow-y-auto overflow-x-hidden pb-30 scroll-thin px-2"
    >
      {includePlanMeta ? <RouteGroupEditFormPlanLabelField /> : null}
      <RouteGroupEditFormRouteSections />
      {includePlanMeta ? <RouteGroupEditFormStopsServiceTimeField /> : null}
      {includePlanMeta ? <RouteGroupEditFormDriverField /> : null}
      {includePlanMeta ? <RouteGroupEditFormCreateVariantToggle /> : null}
    </motion.form>
  )
}
