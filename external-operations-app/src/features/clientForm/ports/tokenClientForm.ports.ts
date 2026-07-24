import type { ClientFormPorts, ClientFormSubmitResult } from "@client-form-kit";
import { fetchClientForm, submitClientForm } from "../../../api/clientForm.api";
import { isClientFormRequestError } from "../domain/clientFormError";
import {
  isTerminalClientFormErrorCode,
  statusFromClientFormErrorCode,
  type ClientFormStatus,
} from "../domain/clientFormStatus";

const GENERIC_FAILURE = "Something went wrong. Please try again.";

type Params = {
  token: string;
  /** Called when the token itself died — the page replaces the form entirely. */
  onTerminated: (status: ClientFormStatus) => void;
};

/**
 * Carries the public form over its single-use token.
 *
 * Everything token-shaped is resolved here so the form kit sees only the three
 * outcomes it knows how to render: accepted, correctable, or over.
 */
export const createTokenClientFormPorts = ({
  token,
  onTerminated,
}: Params): ClientFormPorts => ({
  submit: async (data): Promise<ClientFormSubmitResult> => {
    try {
      await submitClientForm(token, data);
      return { status: "submitted" };
    } catch (error) {
      if (!isClientFormRequestError(error)) {
        return { status: "rejected", message: GENERIC_FAILURE };
      }

      if (isTerminalClientFormErrorCode(error.code)) {
        onTerminated(statusFromClientFormErrorCode(error.code));
        return { status: "terminated" };
      }

      return {
        status: "rejected",
        message: error.detail ?? GENERIC_FAILURE,
        // A team can publish new terms while the customer has the form open.
        // The backend rejects the stale version without touching the order and
        // leaves the token usable, so re-reading the config is the recovery.
        refreshConfig: error.code === "bad_request",
      };
    }
  },

  refreshConfig: async () => {
    const { config } = await fetchClientForm(token);
    return config;
  },
});
