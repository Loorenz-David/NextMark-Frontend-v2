import {
  LocalDeliveryEditFormCreateVariantToggle,
  LocalDeliveryEditFormDriverField,
  LocalDeliveryEditFormEtaToleranceField,
  LocalDeliveryEditFormPlanLabelField,
  LocalDeliveryEditFormStopsServiceTimeField,
  LocalDeliveryEditFormVehicleField,
} from '../../components'

export const LocalDeliveryEditFormDesktopRightColumn = () => {
  return (
    <div className="relative h-full min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-page)]">
      <div className="flex h-full flex-col gap-7 overflow-y-auto scroll-thin overflow-x-hidden px-3 py-4">
        <LocalDeliveryEditFormPlanLabelField />
        <LocalDeliveryEditFormStopsServiceTimeField />
        <LocalDeliveryEditFormEtaToleranceField />
        <LocalDeliveryEditFormDriverField />
        <LocalDeliveryEditFormVehicleField />
        <LocalDeliveryEditFormCreateVariantToggle />
      </div>
    </div>
  )
}
