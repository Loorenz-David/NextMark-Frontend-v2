import { useMemo } from 'react'
import { useSelectedAssignedRoute } from './useSelectedAssignedRoute.controller'

function formatPhone(prefix: string | null | undefined, number: string | null | undefined) {
  const safePrefix = prefix?.trim()
  const safeNumber = number?.trim()

  if (!safePrefix && !safeNumber) {
    return null
  }

  return `${safePrefix ?? ''}${safeNumber ?? ''}`.trim() || null
}

function formatAddressLine(streetAddress: string | null | undefined, city: string | null | undefined, postalCode: string | null | undefined) {
  const parts = [streetAddress, postalCode, city]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(', ') : null
}

export function useStopCustomerController(stopClientId?: string) {
  const route = useSelectedAssignedRoute()

  const stop = useMemo(
    () => route?.stops.find((candidate) => candidate.stopClientId === stopClientId) ?? null,
    [route, stopClientId],
  )

  const customer = useMemo(() => {
    const order = stop?.order
    if (!order) {
      return null
    }

    const fullName = [
      order.client_first_name?.trim(),
      order.client_last_name?.trim(),
    ].filter((value): value is string => Boolean(value)).join(' ') || null

    return {
      fullName,
      email: order.client_email?.trim() || null,
      primaryPhone: formatPhone(order.client_primary_phone?.prefix, order.client_primary_phone?.number),
      secondaryPhone: formatPhone(order.client_secondary_phone?.prefix, order.client_secondary_phone?.number),
      addressLine: formatAddressLine(
        order.client_address?.street_address,
        order.client_address?.city,
        order.client_address?.postal_code,
      ),
      costumerId: order.costumer_id ?? null,
    }
  }, [stop?.order])

  const previewName = customer?.fullName ?? 'Customer details not set'

  return useMemo(() => ({
    stop,
    customer,
    previewName,
  }), [customer, previewName, stop])
}
