import { type ReactNode } from "react";
import type { Order } from "../types/order";
import type { OrderState } from "../types/orderState";
type OpenOrderForm = (payload?: {
  clientId?: string;
  mode?: "create" | "edit";
  deliveryPlanId?: number | null;
  routeGroupId?: number | null;
}) => void;
type OpenOrderCases = (payload: {
  orderId?: number;
  orderReference: string;
}) => void;
type CloseOrderDetail = () => void;
type AdvanceOrderState = (clientId: string) => Promise<void>;
export type OrderDetailContextValue = {
  order: Order | null;
  orderState: OrderState | null;
  orderServerId: number | null;
  isRefreshing: boolean;
  openOrderForm: OpenOrderForm;
  openOrderCases: OpenOrderCases;
  closeOrderDetail: CloseOrderDetail;
  advanceDetailOrderState: AdvanceOrderState;
};
import { OrderDetailContext } from './OrderDetailContext'

export const OrderDetailContextProvider = ({
  value,
  children,
}: {
  value: OrderDetailContextValue;
  children: ReactNode;
}) => (
  <OrderDetailContext.Provider value={value}>
    {children}
  </OrderDetailContext.Provider>
);
