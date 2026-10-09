/**
 * Where the customer is sent after a successful submission.
 *
 * `host` is derived here from the parsed URL, never taken from the wire, so the
 * name the customer reads is always the site they are actually sent to.
 */
export type ClientFormRedirect = {
  href: string;
  host: string;
};

/** Anything a browser strips or reinterprets before it navigates. */
const UNSAFE_CHARACTERS = /[\u0000- \u007F\\]/;

const IPV4_LITERAL = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * The redirect to follow, or `null` when the value must not be navigated to.
 *
 * The backend already validates the URL on save and again when it hands it
 * out; this is the last check before an automatic navigation in the customer's
 * browser, so it refuses rather than repairs. Unlike a tapped media link there
 * is no scheme upgrade or bare-host guessing: anything but a plain public
 * https URL leaves the customer on the confirmation screen.
 */
export const resolveClientFormRedirect = (
  raw: unknown,
): ClientFormRedirect | null => {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048 || UNSAFE_CHARACTERS.test(value)) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  // `https://trusted.se@evil.se` opens evil.se.
  if (url.username || url.password) return null;

  const host = url.hostname;
  if (
    !host ||
    !host.includes(".") ||
    host.startsWith("[") ||
    IPV4_LITERAL.test(host) ||
    host === "localhost" ||
    host.endsWith(".localhost")
  ) {
    return null;
  }

  return { href: url.href, host };
};
