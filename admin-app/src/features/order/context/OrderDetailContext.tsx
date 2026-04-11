import { createContext, useContext, type ReactNode } from "react";

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

const OrderDetailContext = createContext<OrderDetailContextValue | null>(null);

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

export const useOrderDetailContext = () => {
  const context = useContext(OrderDetailContext);
  if (!context) {
    throw new Error(
      "useOrderDetailContext must be used within OrderDetailProvider",
    );
  }
  return context;
};
