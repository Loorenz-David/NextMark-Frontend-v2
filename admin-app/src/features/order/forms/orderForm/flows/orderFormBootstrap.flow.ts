import { DEFAULT_PREFIX, getRememberedPhonePrefix } from '@/constants/dropDownOptions'
import { buildClientId } from '@/lib/utils/clientId'
import type { Phone } from '@/types/phone'

import type { Order } from '../../../types/order'
import { sortDeliveryWindowsUtc } from './orderFormDeliveryWindows.flow'
import type { OrderFormMode, OrderFormState } from '../state/OrderForm.types'

type BuildOrderFormInitialStateParams = {
  mode: OrderFormMode
  order?: Order | null
  payloadDeliveryPlanId?: number | null
  payloadRouteGroupId?: number | null
  payloadRestoreFormState?: OrderFormState | null
}

type BuildOrderFormReinitKeyParams = {
  mode: OrderFormMode
  payloadClientId?: string | null
  payloadDeliveryPlanId?: number | null
  payloadRouteGroupId?: number | null
  orderServerId?: number | null
  orderUpdatedAt?: string | null
  orderItemsUpdatedAt?: string | null
  orderClientFormSubmittedAt?: string | null
}

const toNullableValue = (value: string | number | null | undefined) =>
  value ?? 'null'

const buildReferenceNumber = (date: Date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10_000)).padStart(4, '0')
  return `${day}.${seconds}.${random}`
}

const normalizePhone = (value: Phone | null | undefined): Phone => ({
  prefix: value?.prefix ?? getRememberedPhonePrefix() ?? DEFAULT_PREFIX,
  number: value?.number ?? '',
})

export const buildInitialOrderForm = ({
  mode,
  order,
  deliveryPlanId,
  routeGroupId,
}: {
  mode: OrderFormMode
  order?: Order | null
  deliveryPlanId?: number | null
  routeGroupId?: number | null
}): OrderFormState => ({
  client_id: order?.client_id ?? buildClientId('order'),
  order_plan_objective: order?.order_plan_objective ?? null,
  operation_type: order?.operation_type ?? 'dropoff',
  reference_number: order?.reference_number ?? (mode === 'create' ? buildReferenceNumber() : null),
  external_source: order?.external_source ?? '',
  external_tracking_number: order?.external_tracking_number ?? '',
  external_tracking_link: order?.external_tracking_link ?? '',
  tracking_number: order?.tracking_number ?? '',
  tracking_link: order?.tracking_link ?? '',
  client_first_name: order?.client_first_name ?? '',
  client_last_name: order?.client_last_name ?? '',
  client_email: order?.client_email ?? '',
  client_primary_phone: normalizePhone(order?.client_primary_phone),
  client_secondary_phone: normalizePhone(order?.client_secondary_phone),
  client_address: order?.client_address ?? null,
  delivery_windows: sortDeliveryWindowsUtc(order?.delivery_windows ?? []),
  delivery_plan_id: order?.delivery_plan_id ?? deliveryPlanId ?? null,
  route_group_id: order?.route_group_id ?? routeGroupId ?? null,
  order_note: order?.order_notes?.[0] ?? '',
})

export const buildOrderFormInitialState = ({
  mode,
  order,
  payloadDeliveryPlanId,
  payloadRouteGroupId,
  payloadRestoreFormState,
}: BuildOrderFormInitialStateParams): OrderFormState =>
  payloadRestoreFormState
    ? {
        ...payloadRestoreFormState,
        operation_type: payloadRestoreFormState.operation_type ?? 'dropoff',
        delivery_windows: sortDeliveryWindowsUtc(payloadRestoreFormState.delivery_windows ?? []),
      }
    :
  buildInitialOrderForm({
    mode,
    order,
    deliveryPlanId: payloadDeliveryPlanId ?? null,
    routeGroupId: payloadRouteGroupId ?? null,
  })

export const buildOrderFormReinitKey = ({
  mode,
  payloadClientId,
  payloadDeliveryPlanId,
  payloadRouteGroupId,
  orderServerId,
  orderUpdatedAt,
  orderItemsUpdatedAt,
  orderClientFormSubmittedAt,
}: BuildOrderFormReinitKeyParams) =>
  [
    mode,
    toNullableValue(payloadClientId),
    toNullableValue(payloadDeliveryPlanId),
    toNullableValue(payloadRouteGroupId),
    toNullableValue(orderServerId),
    toNullableValue(orderUpdatedAt),
    toNullableValue(orderItemsUpdatedAt),
    toNullableValue(orderClientFormSubmittedAt),
  ].join('::')

export const shouldReinitializeForm = (
  previousKey: string | null | undefined,
  nextKey: string,
) => previousKey !== nextKey
