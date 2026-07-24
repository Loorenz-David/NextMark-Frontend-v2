import type { TermsDocument } from "@shared-domain";

/**
 * The public projection of the team's client-form configuration, delivered inside
 * the existing `GET /public/client-form/<token>` response.
 *
 * This is a deliberately reduced view of the admin shapes: only enabled rows,
 * no internal bookkeeping fields, terms keyed by `version_id` rather than `id`,
 * and media grouped by placement with empty placements omitted entirely.
 */

/**
 * The placements the form actually renders — deliberately narrower than
 * `Delivery_app_BK/services/domain/client_form/media_placement.py`, which also
 * accepts `form_header`, `form_footer` and `confirmation_screen`.
 *
 * `mapClientFormConfig` drops anything missing here, so a team can configure one
 * of those in the admin console and see nothing on the form. Add the placement
 * to this list at the same time as whatever renders it, never before.
 */
export const MEDIA_PLACEMENTS = [
  "carousel",
  "sidebar_left",
  "sidebar_right",
] as const;

export type MediaPlacement = (typeof MEDIA_PLACEMENTS)[number];

export type ClientFormTerms = {
  /** Sent back as `accepted_terms_version_id` on submit. */
  version_id: number;
  version_number: number;
  content: TermsDocument;
};

export type ClientFormRule = {
  id: number;
  position: number;
  title: string;
  body: string | null;
  icon: string | null;
  image_url: string | null;
};

export type ClientFormMedia = {
  id: number;
  position: number;
  url: string;
  /** Screen-reader text for the `alt` attribute — never visible copy. */
  alt_text: string | null;
  link_url: string | null;
  title: string | null;
  description: string | null;
};

export type ClientFormConfig = {
  terms: ClientFormTerms | null;
  /**
   * True only when the terms section is enabled, acceptance is required, and a
   * version is actually published. The backend rejects submissions without an
   * accepted version while this holds.
   */
  require_terms_acceptance: boolean;
  rules: ClientFormRule[];
  media: Partial<Record<MediaPlacement, ClientFormMedia[]>>;
};

export const EMPTY_CLIENT_FORM_CONFIG: ClientFormConfig = {
  terms: null,
  require_terms_acceptance: false,
  rules: [],
  media: {},
};
