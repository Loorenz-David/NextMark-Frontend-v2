import type { ObjectLinkSelectorMode } from '@/shared/inputs/ObjectLinkSelector'

export type FacilitySelectorProps = {
  mode?: ObjectLinkSelectorMode
  selectedFacilityIds: Array<number | string>
  onSelectionChange: (nextIds: Array<number | string>) => void
  placeholder?: string
  containerClassName?: string
}
