const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const API_BASE = `${BASE_URL}/api_v2/public/order-tracking`;

export interface TrackingTimelineEntry {
  event_name: string;
  label: string;
  occurred_at: string; // ISO 8601
}

export interface OrderTrackingData {
  tracking_number: string | null;
  reference_number: string | null;
  team_name: string;
  team_timezone: string | null;
  current_status: string | null;
  current_status_label: string | null;
  delivery_window_summary: { start_at: string; end_at: string } | null;
  timeline: TrackingTimelineEntry[];
}

export async function fetchOrderTracking(token: string): Promise<OrderTrackingData> {
  const res = await fetch(`${API_BASE}/${token}`);
  if (res.status === 404) {
    throw new Error("not_found");
  }
  if (!res.ok) {
    throw new Error("server_error");
  }
  return res.json();
}
