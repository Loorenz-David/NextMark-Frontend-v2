import type { ClientFormRedirect } from "@client-form-kit";
import type { ClientFormErrorCode } from "./clientFormError";

/**
 * The lifecycle of a single-use form link. It belongs to this app rather than to
 * the form kit: the token is how the public link works, and the in-store device
 * — which renders the same form — has no token and no such states.
 */
export type ClientFormStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "expired" }
  /**
   * A reopened link. The team's page is offered as a link only — sending
   * someone away automatically every time they tap an old SMS would feel like
   * the link is broken.
   */
  | { state: "already_submitted"; redirect: ClientFormRedirect | null }
  | { state: "invalid" }
  | { state: "submitted" };

/**
 * These routes carry their meaning in `code`, not the status — 410 means both
 * "token expired" and "validation failed" depending on the route, so a
 * status-based branch would show an expired screen for a terms rejection.
 */
export const statusFromClientFormErrorCode = (
  code: ClientFormErrorCode,
  redirect: ClientFormRedirect | null = null,
): ClientFormStatus => {
  switch (code) {
    case "token_expired":
      return { state: "expired" };
    case "token_already_used":
      return { state: "already_submitted", redirect };
    default:
      return { state: "invalid" };
  }
};

/** The codes that end the session outright — nothing the customer can correct. */
export const isTerminalClientFormErrorCode = (
  code: ClientFormErrorCode,
): boolean =>
  code === "token_expired" ||
  code === "token_already_used" ||
  code === "token_invalid";
