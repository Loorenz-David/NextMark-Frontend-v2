import { createContext, useContext } from "react";
import type {
  DriverRouteActionCommand,
  DriverRouteActionResult,
} from "@/app/contracts/routeExecution.types";
import type { RouteExecutionStore } from "../stores/routeExecution.store";

export type StopDetailTransitionDirection = "forward" | "backward";

type RouteExecutionShellContextValue = {
  store: RouteExecutionStore;
  initializeRouteWorkspace: () => Promise<void>;
  submitRouteAction: (
    command: DriverRouteActionCommand,
  ) => Promise<DriverRouteActionResult>;
  stopDetailTransitionDirection: StopDetailTransitionDirection;
  prepareRouteStopDetailTransition: (
    previousStopClientId: string | null,
    stopClientId: string,
  ) => boolean;
  routeViewMode: "route" | "search";
  openRouteSearch: () => void;
  closeRouteSearch: () => void;
  routeSearchQuery: string;
  setRouteSearchQuery: (query: string) => void;
  resetRouteSearchQuery: () => void;
  assignedRouteScrollTop: number;
  setAssignedRouteScrollTop: (value: number) => void;
  resetAssignedRouteScrollTop: () => void;
  lastOpenedStopClientId: string | null;
  setLastOpenedStopClientId: (stopClientId: string | null) => void;
  resetLastOpenedStopClientId: () => void;
};

export const RouteExecutionShellContext =
  createContext<RouteExecutionShellContextValue | null>(null);

export function useRouteExecutionShell() {
  const context = useContext(RouteExecutionShellContext);
  if (!context) {
    throw new Error(
      "useRouteExecutionShell must be used within RouteExecutionShellProvider",
    );
  }
  return context;
}
