import { type ReactNode } from "react";
import type { CreateRouteGroupFormContextValue } from "./CreateRouteGroupForm.types";
type ProviderProps = {
  value: CreateRouteGroupFormContextValue;
  children: ReactNode;
};
import { CreateRouteGroupFormContext } from './CreateRouteGroupForm.context'

export const CreateRouteGroupFormContextProvider = ({
  value,
  children,
}: ProviderProps) => (
  <CreateRouteGroupFormContext.Provider value={value}>
    {children}
  </CreateRouteGroupFormContext.Provider>
);
