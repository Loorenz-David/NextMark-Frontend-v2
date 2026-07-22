import type { PropsWithChildren } from "react";

import { useOrderLinkedDeviceFormBackgroundFlow } from "../flows/orderLinkedDeviceFormBackground.flow";

export const OrderLinkedDeviceFormProvider = ({
  employeeUserId,
  children,
}: PropsWithChildren<{ employeeUserId: number }>) => {
  useOrderLinkedDeviceFormBackgroundFlow(employeeUserId);
  return children;
};
