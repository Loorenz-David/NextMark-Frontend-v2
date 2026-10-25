import { createContext, useContext } from "react";

import type { CreateRouteGroupFormContextValue } from "./CreateRouteGroupForm.types";

export const CreateRouteGroupFormContext =
  createContext<CreateRouteGroupFormContextValue | null>(null);


export const useCreateRouteGroupForm = () => {
  const context = useContext(CreateRouteGroupFormContext);
  if (!context) {
    throw new Error(
      "CreateRouteGroupForm context is missing. Wrap with CreateRouteGroupFormProvider.",
    );
  }

  return context;
};
