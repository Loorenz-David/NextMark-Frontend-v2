import {
  mapClientFormConfig,
  type ClientFormConfig,
  type ClientFormData,
  type ClientFormMeta,
} from "@client-form-kit";
import {
  resolveClientFormErrorCode,
  type ClientFormRequestError,
} from "../features/clientForm/domain/clientFormError";

// In production, VITE_API_BASE_URL is the full origin (e.g. https://api.nextmark.app).
// In development the Vite dev-server proxy forwards /api_v2/* → http://localhost:5050,
// so an empty base string is correct and the path alone is sufficient.
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const BASE = `${BASE_URL}/public/client-form`;

/** What one token yields: the order it belongs to, and the team's form config. */
export type ClientFormBootstrap = {
  meta: ClientFormMeta;
  config: ClientFormConfig;
};

type ClientOrderNotePayload = {
  type: "COSTUMER";
  content: string;
};

type ClientFormSubmitPayload = Omit<
  ClientFormData,
  "order_notes" | "accepted_terms_version_id"
> & {
  order_notes: ClientOrderNotePayload;
  accepted_terms_version_id?: number;
};

type ClientFormItemDto = {
  item_type?: string | null;
  quantity?: number | null;
};

type ClientFormMetaDto = Omit<ClientFormMeta, "items"> & {
  items?: ClientFormItemDto[] | null;
  config?: unknown;
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
    marketing_messages: payload.marketing_messages,
    // Omitted entirely when nothing was accepted — the backend rejects a null
    // and only requires the key when acceptance is mandatory.
    ...(typeof payload.accepted_terms_version_id === "number"
      ? { accepted_terms_version_id: payload.accepted_terms_version_id }
      : {}),
  };
};

async function handleResponse(res: Response): Promise<unknown> {
  const body = await res.text();
  let parsed: unknown = undefined;
  try {
    parsed = body ? JSON.parse(body) : undefined;
  } catch {
    parsed = undefined;
  }

  if (res.ok) {
    return parsed;
  }

  const payload =
    typeof parsed === "object" && parsed !== null
      ? (parsed as { error?: unknown; code?: unknown })
      : {};
  const detail = typeof payload.error === "string" ? payload.error : undefined;

  const err = new Error(detail ?? `HTTP ${res.status}`) as ClientFormRequestError;
  err.status = res.status;
  err.code = resolveClientFormErrorCode(payload.code, res.status);
  err.detail = detail;
  throw err;
}

/**
 * The response carries the order and the team's configuration in one body; the
 * form kit holds them apart so that re-reading the config after a terms
 * republish cannot disturb the order it is being filled against.
 */
const mapClientFormBootstrap = (
  payload: ClientFormMetaDto,
): ClientFormBootstrap => {
  const { config, items, ...meta } = payload;

  return {
    meta: {
      ...meta,
      items: (items ?? []).map((item) => ({
        name: item.item_type?.trim() || "Unnamed item",
        quantity: typeof item.quantity === "number" ? item.quantity : 0,
      })),
    },
    config: mapClientFormConfig(config),
  };
};

export async function fetchClientForm(
  token: string,
): Promise<ClientFormBootstrap> {
  const res = await fetch(`${BASE}/${token}`);
  const payload = (await handleResponse(res)) as ClientFormMetaDto;
  return mapClientFormBootstrap(payload);
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
