import type { ClientFormMeta } from "../features/clientForm/domain/clientForm.types";
import type { ClientFormData } from "../features/clientForm/domain/clientForm.types";

// In production, VITE_API_BASE_URL is the full origin (e.g. https://api.nextmark.app).
// In development the Vite dev-server proxy forwards /api_v2/* → http://localhost:5050,
// so an empty base string is correct and the path alone is sufficient.
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const BASE = `${BASE_URL}/api_v2/public/client-form`;

type ApiError = Error & { status?: number };

type ClientOrderNotePayload = {
  type: "COSTUMER";
  content: string;
};

type ClientFormSubmitPayload = Omit<
  ClientFormData,
  "order_notes" | "client_primary_phone" | "client_secondary_phone"
> & {
  client_primary_phone: ClientFormData["client_primary_phone"];
  client_secondary_phone: ClientFormData["client_secondary_phone"];
  order_notes: ClientOrderNotePayload;
};

type ClientFormItemDto = {
  item_type?: string | null;
  quantity?: number | null;
};

type ClientFormMetaDto = Omit<ClientFormMeta, "items"> & {
  items?: ClientFormItemDto[] | null;
};

const normalizePhone = (value: ClientFormData["client_primary_phone"]) => {
  if (!value) return null;

  const number = value.number.trim();
  if (!number) return null;

  return {
    prefix: value.prefix,
    number,
  };
};

const normalizeClientFormPayload = (
  payload: ClientFormData,
): ClientFormSubmitPayload => {
  const trimmedNote = payload.order_notes.trim();

  return {
    client_first_name: payload.client_first_name,
    client_last_name: payload.client_last_name,
    client_primary_phone: normalizePhone(payload.client_primary_phone),
    client_secondary_phone: normalizePhone(payload.client_secondary_phone),
    client_email: payload.client_email,
    client_address: payload.client_address,
    order_notes: { type: "COSTUMER", content: trimmedNote },
  };
};

async function handleResponse(res: Response): Promise<unknown> {
  if (!res.ok) {
    const err: ApiError = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

const mapClientFormMeta = (payload: ClientFormMetaDto): ClientFormMeta => {
  return {
    ...payload,
    items: (payload.items ?? []).map((item) => ({
      name: item.item_type?.trim() || "Unnamed item",
      quantity: typeof item.quantity === "number" ? item.quantity : 0,
    })),
  };
};

export async function fetchClientForm(token: string): Promise<ClientFormMeta> {
  const res = await fetch(`${BASE}/${token}`);
  const payload = (await handleResponse(res)) as ClientFormMetaDto;
  return mapClientFormMeta(payload);
}

export async function submitClientForm(
  token: string,
  payload: ClientFormData,
): Promise<void> {
  const normalizedPayload = normalizeClientFormPayload(payload);

  const res = await fetch(`${BASE}/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedPayload),
  });
  await handleResponse(res);
}
