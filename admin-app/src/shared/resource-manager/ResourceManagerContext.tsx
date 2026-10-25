import { createContext } from "react";

import type { StackActionManager } from "../stack-manager/StackActionManager";
import type { BaseControls } from "./types";

import type { MapBridge } from "@/shared/map";

export type PlanDropFeedback = {
  planClientId: string;
  movedCount: number;
  status: "success" | "error";
  token: string;
};

export type UnscheduleDropFeedback = {
  movedCount: number;
  status: "success" | "error";
  token: string;
};

export type KnownResourceRegistry = {
  popupManager?: StackActionManager<Record<string, unknown>>;
  sectionManager?: StackActionManager<Record<string, unknown>>;
  mapManager?: MapBridge;
  settingsPopupManager?: StackActionManager<Record<string, unknown>>;
  popupConfirmationManager?: StackActionManager<Record<string, unknown>>;
  baseControlls?: BaseControls<unknown>;
  planDropFeedback?: PlanDropFeedback | null;
  unscheduleDropFeedback?: UnscheduleDropFeedback | null;
  routeReorderPreview?: unknown;
  routeOperationsActiveDrag?: unknown;
};

export type ResourceRegistry<
  T extends Record<string, unknown> = KnownResourceRegistry,
> = Partial<T> & Record<string, unknown>;

export const ResourcesManagerContext = createContext<ResourceRegistry | null>(
  null,
);
