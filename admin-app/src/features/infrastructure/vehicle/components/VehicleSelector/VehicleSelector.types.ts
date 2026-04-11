import type { ObjectLinkSelectorMode } from '@/shared/inputs/ObjectLinkSelector'

type VehicleSelectorLegacyProps = {
  selectedVehicle: number | null | undefined
  onSelectVehicle: (vehicleId: number | null) => void
  mode?: never
  selectedVehicleIds?: never
  onSelectionChange?: never
}

type VehicleSelectorSelectionProps = {
  mode?: ObjectLinkSelectorMode
  selectedVehicleIds: Array<number | string>
  onSelectionChange: (nextIds: Array<number | string>) => void
  selectedVehicle?: never
  onSelectVehicle?: never
}

type VehicleSelectorSharedProps = {
  placeholder?: string
  containerClassName?: string
}

export type VehicleSelectorProps = (
  | VehicleSelectorLegacyProps
  | VehicleSelectorSelectionProps
) &
  VehicleSelectorSharedProps
