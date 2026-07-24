/**
 * Public client-form routes carry their meaning in `code`, not in the HTTP
 * status: 410 means both "token expired" and "validation failed" depending on
 * the route, and the submit route currently answers validation failures with a
 * 500 while still setting `code: "bad_request"`. Every consumer therefore
 * branches on the code and treats the status as advisory.
 */
export type ClientFormErrorCode =
  | "token_invalid"
  | "token_expired"
  | "token_already_used"
  | "bad_request"
  | "internal_error"
  | "unknown";

export type ClientFormRequestError = Error & {
  status?: number;
  code: ClientFormErrorCode;
  /** The backend's own message — safe to show, it is written for the customer. */
  detail?: string;
};

const KNOWN_CODES: ClientFormErrorCode[] = [
  "token_invalid",
  "token_expired",
  "token_already_used",
  "bad_request",
  "internal_error",
];

const isKnownCode = (value: unknown): value is ClientFormErrorCode =>
  typeof value === "string" &&
  (KNOWN_CODES as string[]).includes(value);

/** Falls back to the status only when the body carried no usable `code`. */
export const resolveClientFormErrorCode = (
  code: unknown,
  status: number,
): ClientFormErrorCode => {
  if (isKnownCode(code)) {
    return code;
  }

  if (status === 404) return "token_invalid";
  if (status === 409) return "token_already_used";
  if (status === 410) return "token_expired";
  if (status >= 500) return "internal_error";

  return "unknown";
};

export const isClientFormRequestError = (
  error: unknown,
): error is ClientFormRequestError =>
  error instanceof Error && "code" in error;
