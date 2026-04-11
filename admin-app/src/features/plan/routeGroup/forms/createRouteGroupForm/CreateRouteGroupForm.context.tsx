import { createContext, useContext, type ReactNode } from "react";

import type { CreateRouteGroupFormContextValue } from "./CreateRouteGroupForm.types";

type ProviderProps = {
  value: CreateRouteGroupFormContextValue;
  children: ReactNode;
};

const CreateRouteGroupFormContext =
  createContext<CreateRouteGroupFormContextValue | null>(null);

export const CreateRouteGroupFormContextProvider = ({
  value,
  children,
}: ProviderProps) => (
  <CreateRouteGroupFormContext.Provider value={value}>
    {children}
  </CreateRouteGroupFormContext.Provider>
);

export const useCreateRouteGroupForm = () => {
  const context = useContext(CreateRouteGroupFormContext);
  if (!context) {
    throw new Error(
      "CreateRouteGroupForm context is missing. Wrap with CreateRouteGroupFormProvider.",
    );
  }

  return context;
};
