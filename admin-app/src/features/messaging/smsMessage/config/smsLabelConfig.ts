import type { LabelDefinition } from "@/shared/inputs/LabelPicker/labelTypes";

export const allowedLabels: LabelDefinition[] = [
  { id: "client_first_name", displayName: "Client name" },
  { id: "plan_delivery_date_display", displayName: "Delivery date" },
  { id: "reschedule_time", displayName: "Reschedule time" },
  { id: "tracking_number", displayName: "Tracking number" },
  { id: "tracking_link", displayName: "Tracking page" },
  {
    id: "expected_arrival_time_costumer",
    displayName: "Expected arrival time",
  },
  { id: "driver_phone", displayName: "Driver phone" },
  { id: "client_address", displayName: "Client address" },
];
