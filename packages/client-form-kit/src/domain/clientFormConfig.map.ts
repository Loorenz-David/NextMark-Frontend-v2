import { termsDocumentFromUnknown } from "@shared-domain";
import {
  EMPTY_CLIENT_FORM_CONFIG,
  MEDIA_PLACEMENTS,
  type ClientFormConfig,
  type ClientFormMedia,
  type ClientFormRule,
  type ClientFormTerms,
  type MediaPlacement,
} from "./clientFormConfig.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const isMediaPlacement = (value: string): value is MediaPlacement =>
  (MEDIA_PLACEMENTS as readonly string[]).includes(value);

const mapTerms = (value: unknown): ClientFormTerms | null => {
  if (!isRecord(value) || typeof value.version_id !== "number") {
    return null;
  }

  return {
    version_id: value.version_id,
    version_number:
      typeof value.version_number === "number" ? value.version_number : 0,
    content: termsDocumentFromUnknown(value.content),
  };
};

const mapRule = (value: unknown): ClientFormRule | null => {
  if (!isRecord(value) || typeof value.id !== "number") {
    return null;
  }

  const title = readString(value.title);
  if (!title) {
    return null;
  }

  return {
    id: value.id,
    position: typeof value.position === "number" ? value.position : 0,
    title,
    body: readString(value.body),
    icon: readString(value.icon),
    image_url: readString(value.image_url),
  };
};

const mapMedia = (value: unknown): ClientFormMedia | null => {
  if (!isRecord(value) || typeof value.id !== "number") {
    return null;
  }

  const url = readString(value.url);
  if (!url) {
    return null;
  }

  return {
    id: value.id,
    position: typeof value.position === "number" ? value.position : 0,
    url,
    alt_text: readString(value.alt_text),
    link_url: readString(value.link_url),
    title: readString(value.title),
    description: readString(value.description),
  };
};

/**
 * `config` is always present with all four keys, but every section is optional in
 * practice — a team that configured nothing yields nulls and empties. Parsing
 * defensively here keeps every consumer free of shape checks.
 */
export const mapClientFormConfig = (input: unknown): ClientFormConfig => {
  if (!isRecord(input)) {
    return EMPTY_CLIENT_FORM_CONFIG;
  }

  const rules = Array.isArray(input.rules)
    ? input.rules
        .map(mapRule)
        .filter((rule): rule is ClientFormRule => rule !== null)
        .sort((left, right) => left.position - right.position)
    : [];

  const media: ClientFormConfig["media"] = {};
  if (isRecord(input.media)) {
    for (const [placement, items] of Object.entries(input.media)) {
      // A placement the backend adds later must not crash an older form build.
      if (!isMediaPlacement(placement) || !Array.isArray(items)) {
        continue;
      }
      const mapped = items
        .map(mapMedia)
        .filter((item): item is ClientFormMedia => item !== null)
        .sort((left, right) => left.position - right.position);
      if (mapped.length) {
        media[placement] = mapped;
      }
    }
  }

  const terms = mapTerms(input.terms);

  return {
    terms,
    // Never trust the flag alone — without a version there is nothing to accept.
    require_terms_acceptance: input.require_terms_acceptance === true && terms !== null,
    rules,
    media,
  };
};
