import type { ChangeEvent, Dispatch, SetStateAction } from 'react'

import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'
import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

import {
  buildDefaultCostumerAddress,
  buildDefaultCostumerPhone,
  buildDefaultCostumerSecondaryPhone,
} from '../flows/costumerFormBootstrap.flow'
import {
  removeOperatingHoursDay,
  setOperatingHoursCloseTimeValue,
  setOperatingHoursClosedState,
  setOperatingHoursOpenTimeValue,
  toggleOperatingHoursDay,
} from '../flows/costumerOperatingHours.flow'
import type { CostumerFormState, CostumerFormWarnings } from './CostumerForm.types'

const ensureFirstPhoneEntry = (phones: CostumerFormState['phones']) => {
  if (phones.length > 0) {
    return phones
  }

  return [buildDefaultCostumerPhone()]
}

const ensureSecondaryPhoneEntry = (phones: CostumerFormState['phones']) => {
  const withPrimary = ensureFirstPhoneEntry(phones)
  if (withPrimary.length > 1) {
    return withPrimary
  }
  return [...withPrimary, buildDefaultCostumerSecondaryPhone()]
}

const ensureFirstAddressEntry = (addresses: CostumerFormState['addresses']) => {
  if (addresses.length > 0) {
    return addresses
  }

  return [buildDefaultCostumerAddress()]
}

export const useCostumerFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<CostumerFormState>>
  warnings: CostumerFormWarnings
}) => {
  const handleFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, first_name: value }))
    warnings.firstNameWarning.validate(value)
  }

  const handleLastName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, last_name: value }))
    warnings.lastNameWarning.validate(value)
  }

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, email: value }))
    warnings.emailWarning.validate(value)
  }

  const handlePrimaryPhone = (value: Phone) => {
    setFormState((prev) => {
      const phones = ensureSecondaryPhoneEntry(prev.phones)
      const first = phones[0]

      return {
        ...prev,
        phones: [
          {
            ...first,
            phone: {
              prefix: value.prefix ?? DEFAULT_PREFIX,
              number: value.number ?? '',
            },
          },
          ...phones.slice(1),
        ],
      }
    })
  }

  const handleSecondaryPhone = (value: Phone) => {
    setFormState((prev) => {
      const phones = ensureSecondaryPhoneEntry(prev.phones)
      const second = phones[1]

      return {
        ...prev,
        phones: [
          phones[0],
          {
            ...second,
            phone: {
              prefix: value.prefix ?? DEFAULT_PREFIX,
              number: value.number ?? '',
            },
          },
          ...phones.slice(2),
        ],
      }
    })
  }

  const handleDefaultAddress = (value: address | null) => {
    setFormState((prev) => {
      const addresses = ensureFirstAddressEntry(prev.addresses)
      const first = addresses[0]

      return {
        ...prev,
        addresses: [{ ...first, address: value }, ...addresses.slice(1)],
      }
    })
  }

  const toggleOperatingDay = (weekday: number) => {
    setFormState((prev) => {
      const operatingHours = toggleOperatingHoursDay({
        entries: prev.operating_hours,
        weekday,
      })
      warnings.operatingHoursWarning.validate(operatingHours)
      return { ...prev, operating_hours: operatingHours }
    })
  }

  const setOperatingDayClosed = (weekday: number, isClosed: boolean) => {
    setFormState((prev) => {
      const operatingHours = setOperatingHoursClosedState({
        entries: prev.operating_hours,
        weekday,
        isClosed,
      })
      warnings.operatingHoursWarning.validate(operatingHours)
      return { ...prev, operating_hours: operatingHours }
    })
  }

  const setOperatingDayOpenTime = (weekday: number, value: string | null) => {
    setFormState((prev) => {
      const operatingHours = setOperatingHoursOpenTimeValue({
        entries: prev.operating_hours,
        weekday,
        value,
      })
      warnings.operatingHoursWarning.validate(operatingHours)
      return { ...prev, operating_hours: operatingHours }
    })
  }

  const setOperatingDayCloseTime = (weekday: number, value: string | null) => {
    setFormState((prev) => {
      const operatingHours = setOperatingHoursCloseTimeValue({
        entries: prev.operating_hours,
        weekday,
        value,
      })
      warnings.operatingHoursWarning.validate(operatingHours)
      return { ...prev, operating_hours: operatingHours }
    })
  }

  const removeOperatingDay = (weekday: number) => {
    setFormState((prev) => {
      const operatingHours = removeOperatingHoursDay({
        entries: prev.operating_hours,
        weekday,
      })
      warnings.operatingHoursWarning.validate(operatingHours)
      return { ...prev, operating_hours: operatingHours }
    })
  }

  return {
    handleFirstName,
    handleLastName,
    handleEmail,
    handlePrimaryPhone,
    handleSecondaryPhone,
    handleDefaultAddress,
    toggleOperatingDay,
    setOperatingDayClosed,
    setOperatingDayOpenTime,
    setOperatingDayCloseTime,
    removeOperatingDay,
  }
}
