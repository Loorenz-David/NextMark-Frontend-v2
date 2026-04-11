import type { LabelDefinition } from "@/shared/inputs/LabelPicker/labelTypes";

export const allowedLabels: LabelDefinition[] = [
  { id: "client_first_name", displayName: "Client name" },
  { id: "plan_delivery_date_display", displayName: "Planned delivery date" },
  { id: "tracking_number", displayName: "Tracking number" },
  { id: "tracking_link", displayName: "Tracking page" },

  {
    id: "expected_arrival_time_costumer",
    displayName: "Expected arrival time",
  },
  { id: "client_address", displayName: "Client address" },
  { id: "client_phone_number", displayName: "Client phone number" },
  {
    id: "client_phone_number_secondary",
    displayName: "Client secondary phone number",
  },
  { id: "client_form_link", displayName: "Client form link" },
];
