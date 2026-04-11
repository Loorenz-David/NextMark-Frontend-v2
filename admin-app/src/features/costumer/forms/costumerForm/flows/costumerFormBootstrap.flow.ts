import { DEFAULT_PREFIX, getRememberedPhonePrefix } from '@/constants/dropDownOptions'
import { buildClientId } from '@/lib/utils/clientId'

import type {
  Costumer,
  CostumerAddress,
  CostumerOperatingHours,
  CostumerPhone,
} from '../../../dto/costumer.dto'
import type { CostumerFormMode, CostumerFormState } from '../state/CostumerForm.types'
import { normalizeOperatingHoursForForm } from './costumerOperatingHours.flow'

const cloneAddress = (entry: CostumerAddress): CostumerAddress => ({
  ...entry,
  address: entry.address ? { ...entry.address } : entry.address ?? null,
})

const clonePhone = (entry: CostumerPhone): CostumerPhone => ({
  ...entry,
  phone: entry.phone ? { ...entry.phone } : entry.phone ?? null,
})

export const buildDefaultCostumerAddress = (): CostumerAddress => ({
  client_id: buildClientId('costumer_address'),
  label: 'default',
  address: null,
  is_default: true,
})

export const buildDefaultCostumerPhone = (): CostumerPhone => ({
  client_id: buildClientId('costumer_phone'),
  label: 'default',
  phone: { prefix: getRememberedPhonePrefix() ?? DEFAULT_PREFIX, number: '' },
  is_default_primary: true,
})

export const buildDefaultCostumerSecondaryPhone = (): CostumerPhone => ({
  client_id: buildClientId('costumer_phone'),
  label: 'secondary',
  phone: { prefix: getRememberedPhonePrefix() ?? DEFAULT_PREFIX, number: '' },
  is_default_secondary: true,
})

export const ensureEditableAddresses = (
  addresses: CostumerAddress[] | null | undefined,
  fallbackDefault?: CostumerAddress | null,
): CostumerAddress[] => {
  if (addresses && addresses.length > 0) {
    return addresses.map(cloneAddress)
  }

  if (fallbackDefault) {
    return [cloneAddress(fallbackDefault)]
  }

  return [buildDefaultCostumerAddress()]
}

export const ensureEditablePhones = (
  phones: CostumerPhone[] | null | undefined,
  fallbackPrimary?: CostumerPhone | null,
  fallbackSecondary?: CostumerPhone | null,
): CostumerPhone[] => {
  if (phones && phones.length > 0) {
    const cloned = phones.map(clonePhone)
    const primary = cloned.find((entry) => entry.is_default_primary) ?? cloned[0]
    const secondary = cloned.find((entry) => entry.is_default_secondary)

    return [
      primary ?? buildDefaultCostumerPhone(),
      secondary ?? clonePhone(fallbackSecondary ?? buildDefaultCostumerSecondaryPhone()),
    ]
  }

  return [
    clonePhone(fallbackPrimary ?? buildDefaultCostumerPhone()),
    clonePhone(fallbackSecondary ?? buildDefaultCostumerSecondaryPhone()),
  ]
}

export const ensureEditableOperatingHours = (
  operatingHours: CostumerOperatingHours[] | null | undefined,
) => normalizeOperatingHoursForForm(operatingHours)

export const buildCostumerFormInitialState = ({
  mode,
  costumer,
}: {
  mode: CostumerFormMode
  costumer?: Costumer | null
}): CostumerFormState => {
  if (mode === 'create') {
    return {
      first_name: '',
      last_name: '',
      email: '',
      addresses: ensureEditableAddresses([]),
      phones: ensureEditablePhones([]),
      operating_hours: [],
    }
  }

  return {
    first_name: costumer?.first_name ?? '',
    last_name: costumer?.last_name ?? '',
    email: costumer?.email ?? '',
    addresses: ensureEditableAddresses(costumer?.addresses, costumer?.default_address),
    phones: ensureEditablePhones(
      costumer?.phones,
      costumer?.default_primary_phone,
      costumer?.default_secondary_phone,
    ),
    operating_hours: ensureEditableOperatingHours(costumer?.operating_hours),
  }
}

const toNullableValue = (value: string | number | null | undefined) => value ?? 'null'

export const buildCostumerFormReinitKey = ({
  mode,
  payloadClientId,
  costumerServerId,
}: {
  mode: CostumerFormMode
  payloadClientId?: string | null
  costumerServerId?: number | null
}) => [mode, toNullableValue(payloadClientId), toNullableValue(costumerServerId)].join('::')

export const shouldReinitializeCostumerForm = (
  previousKey: string | null | undefined,
  nextKey: string,
) => previousKey !== nextKey
