import type { OrderTrackingData } from "../../../api/orderTracking.api";

export type TrackingPageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error" }
  | { status: "ready"; data: OrderTrackingData };
