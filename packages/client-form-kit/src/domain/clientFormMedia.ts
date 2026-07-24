import type {
  ClientFormConfig,
  ClientFormMedia,
  MediaPlacement,
} from "./clientFormConfig.types";

/**
 * The mapper already drops empty placements, sorts each one by `position` and
 * discards rows without a usable URL, so callers get a ready-to-render list and
 * never a shape check.
 */
export const getClientFormMedia = (
  config: ClientFormConfig,
  placement: MediaPlacement,
): ClientFormMedia[] => config.media[placement] ?? [];

export const hasClientFormMedia = (
  config: ClientFormConfig,
  placement: MediaPlacement,
): boolean => getClientFormMedia(config, placement).length > 0;

/** Schemes a promotional link has any business using. */
const SAFE_LINK_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

const SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/i;

/** Matches what a URL parser discards before it reads the scheme. */
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

/**
 * The URL to navigate to, or `null` when the stored link must not be followed.
 *
 * `link_url` is free text: nothing on the write path constrains it — not the
 * column, not the admin form — so the value arriving here is whatever a team
 * typed, and it is about to become an `href` in a customer's browser. A
 * `javascript:` link would run as script on a public page, which is why the
 * scheme is checked against an allow-list: an unknown scheme is refused rather
 * than passed through.
 */
export const resolveClientFormMediaHref = (
  linkUrl: string | null,
): string | null => {
  if (!linkUrl) return null;

  // Browsers drop control characters before parsing, so `java<TAB>script:…`
  // navigates as `javascript:…`. Strip them first, and validate the string that
  // will actually be navigated to rather than the one that was typed.
  const href = linkUrl.replace(CONTROL_CHARACTERS, "").trim();
  if (!href) return null;

  // Protocol-relative. The form is served over https, so this one is settled.
  if (href.startsWith("//")) return `https:${href}`;

  const scheme = SCHEME_PATTERN.exec(href)?.[1];

  /**
   * A team typing `example.com` into the admin console means the site. Left as
   * written it is a *relative* URL, so the browser resolves it against the
   * form's own address and the link opens a dead path on the form itself
   * instead of the advertiser — which looks exactly like a link that does
   * nothing. No promotional link is ever meant to point back at the form.
   */
  if (!scheme) return `https://${href}`;

  return SAFE_LINK_SCHEMES.has(`${scheme.toLowerCase()}:`) ? href : null;
};
