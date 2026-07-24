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
  /** The exact version the customer ticked; `null` when nothing was accepted. */
  accepted_terms_version_id: number | null;
  marketing_messages: boolean;
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

export type ClientFormItem = {
  name: string;
  quantity: number;
  description?: string;
};

/**
 * What the form knows about the order it is collecting details for.
 *
 * Every field is optional: the in-store linked device opens the form before an
 * order exists, so it is handed an empty meta and renders only the sections
 * that have something to show.
 */
export type ClientFormMeta = {
  order_scalar_id?: number | null;
  reference_number?: string | null;
  external_source?: string | null;
  team_timezone?: string | null;
  items?: ClientFormItem[] | null;
  expires_at?: string | null;
  order_notes?: ClientOrderNote[] | null;
};

export const EMPTY_CLIENT_FORM_META: ClientFormMeta = {};
