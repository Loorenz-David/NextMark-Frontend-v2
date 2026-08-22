/**
 * What the in-store customer form advertises to Safari so an iPad can install it
 * from the Share sheet and run it without browser chrome.
 *
 * This is presentation metadata only. The form is still the same route of the
 * same admin SPA, served from the same deployment — nothing here makes the app
 * offline-capable, and nothing here belongs to any other admin route.
 *
 * Both the manifest and the legacy `apple-*` meta tags are declared on purpose.
 * Safari has honoured `apple-mobile-web-app-capable` since long before it read
 * manifests, so if the manifest ever fails to load — a wrong content type off
 * S3 would do it — the tablet still installs standalone instead of silently
 * falling back to a browser tab.
 */

import type { ManagedHeadTag } from './managedHead'

export const EXTERNAL_FORM_PATH = '/external-form'

export const EXTERNAL_FORM_MANIFEST_PATH = '/external-form.webmanifest'

const ICON_BASE = '/pwa/external-form'

export const EXTERNAL_FORM_APPLE_TOUCH_ICON = `${ICON_BASE}/apple-touch-icon-180.png`

/**
 * The half of the manifest that code depends on. The manifest itself is a static
 * file under `public/` because the browser has to fetch it by URL; these are the
 * fields a reviewer would otherwise have to check by eye, so
 * `scripts/check-external-form-manifest.mjs` asserts the file still agrees.
 */
export const EXTERNAL_FORM_MANIFEST_CONTRACT = {
  start_url: EXTERNAL_FORM_PATH,
  scope: EXTERNAL_FORM_PATH,
  display: 'standalone',
  name: 'NextMark Customer Form',
  short_name: 'Customer Form',
  /** The client-form `--paper` tone, so the launch splash matches the page. */
  background_color: '#efe7d7',
  theme_color: '#efe7d7',
} as const

export const EXTERNAL_FORM_DOCUMENT_TITLE = 'Customer Form'

/**
 * True for the route family the installed app is allowed to be.
 *
 * The exact path and its children only: `/external-form-archive` is a different
 * route and must not advertise the form's manifest.
 */
export const isExternalFormPath = (pathname: string): boolean =>
  pathname === EXTERNAL_FORM_PATH ||
  pathname.startsWith(`${EXTERNAL_FORM_PATH}/`)

/**
 * The tags the external-form route owns while it is mounted.
 *
 * `apple-mobile-web-app-status-bar-style` stays `default` rather than
 * `black-translucent`: the form is a light paper surface, and translucent would
 * put the clock on top of the form's own header instead of above it.
 */
export const EXTERNAL_FORM_PWA_HEAD_TAGS: readonly ManagedHeadTag[] = [
  {
    key: 'manifest',
    tagName: 'link',
    attributes: { rel: 'manifest', href: EXTERNAL_FORM_MANIFEST_PATH },
  },
  {
    key: 'apple-touch-icon',
    tagName: 'link',
    attributes: {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: EXTERNAL_FORM_APPLE_TOUCH_ICON,
    },
  },
  {
    key: 'apple-web-app-capable',
    tagName: 'meta',
    attributes: { name: 'apple-mobile-web-app-capable', content: 'yes' },
  },
  {
    key: 'mobile-web-app-capable',
    tagName: 'meta',
    attributes: { name: 'mobile-web-app-capable', content: 'yes' },
  },
  {
    key: 'apple-status-bar-style',
    tagName: 'meta',
    attributes: {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
  },
  {
    key: 'apple-web-app-title',
    tagName: 'meta',
    attributes: {
      name: 'apple-mobile-web-app-title',
      content: EXTERNAL_FORM_MANIFEST_CONTRACT.short_name,
    },
  },
  {
    key: 'theme-color',
    tagName: 'meta',
    attributes: {
      name: 'theme-color',
      content: EXTERNAL_FORM_MANIFEST_CONTRACT.theme_color,
    },
  },
]

export type PwaHeadState = {
  tags: readonly ManagedHeadTag[]
  title: string | null
}

/**
 * The whole route-awareness rule: on the form, advertise the form; anywhere
 * else in the admin console, advertise nothing.
 */
export const resolvePwaHeadState = (pathname: string): PwaHeadState =>
  isExternalFormPath(pathname)
    ? { tags: EXTERNAL_FORM_PWA_HEAD_TAGS, title: EXTERNAL_FORM_DOCUMENT_TITLE }
    : { tags: [], title: null }
