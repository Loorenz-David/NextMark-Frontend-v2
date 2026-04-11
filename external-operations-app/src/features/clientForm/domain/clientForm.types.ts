import type { Phone } from "@shared-domain/core/phone";
import type { address } from "@shared-domain/core/address";

export type { Phone, address };

export type ClientFormData = {
  client_first_name: string;
  client_last_name: string;
  client_primary_phone: Phone | null;
  client_secondary_phone: Phone | null;
  client_email: string;
  client_address: address | null;
  order_notes: string;
};

export type ClientOrderNoteType = "GENERAL" | "COSTUMER";

export type ClientOrderNote = {
  type?: ClientOrderNoteType | string | null;
  content?: string | null;
  creation_date?: string | null;
};
export type ClientFormStep =
  | "client_info"
  | "contact_info"
  | "delivery_address";

export type ClientFormMeta = {
  order_scalar_id: number;
  team_timezone?: string | null;
  items: ClientFormItem[];
  expires_at: string;
  order_notes?: ClientOrderNote[] | null;
};

export type ClientFormItem = {
  name: string;
  quantity: number;
  description?: string;
};

export type ClientFormStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "expired" }
  | { state: "already_submitted" }
  | { state: "invalid" }
  | { state: "submitted" };
