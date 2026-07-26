import { generateClientFormLink } from "../api/clientFormLink.api";
import {
  getClientFormLinkPreview,
  setClientFormLinkPreview,
} from "../store/clientFormLinkPreview.store";
import { updateOrderByClientId, upsertOrder } from "../store/order.store";

const GENERATED_CLIENT_FORM_TOKEN_PLACEHOLDER =
  "__generated_client_form_link__";

export type EnsureOrderClientFormLinkResult = {
  hasGeneratedLink: true;
  formUrl: string | null;
  expiresAt: string | null;
};

export const ensureOrderClientFormLink = async ({
  orderId,
  orderClientId,
  hasGeneratedLink,
}: {
  orderId: number;
  orderClientId?: string | null;
  hasGeneratedLink: boolean;
}): Promise<EnsureOrderClientFormLinkResult> => {
  const cachedPreview = getClientFormLinkPreview(orderId);
  if (hasGeneratedLink) {
    return {
      hasGeneratedLink: true,
      formUrl: cachedPreview?.formUrl ?? null,
      expiresAt: cachedPreview?.expiresAt ?? null,
    };
  }

  const response = await generateClientFormLink(orderId);
  const formUrl = response.form_url ?? null;
  const expiresAt = response.expires_at ?? null;

  if (formUrl || expiresAt) {
    setClientFormLinkPreview(orderId, {
      formUrl,
      expiresAt,
    });
  }

  if (response.order) {
    upsertOrder(response.order);
  }

  if (orderClientId) {
    updateOrderByClientId(orderClientId, (order) => ({
      ...order,
      client_form_token_hash:
        order.client_form_token_hash ??
        GENERATED_CLIENT_FORM_TOKEN_PLACEHOLDER,
    }));
  }

  return {
    hasGeneratedLink: true,
    formUrl,
    expiresAt,
  };
};
