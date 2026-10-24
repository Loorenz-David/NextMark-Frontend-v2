/**
 * Contract checks for the route-aware external-form PWA metadata.
 *
 * The manifest has to be a static file so the browser can fetch it by URL, which
 * puts it out of reach of the type checker — this is what keeps it honest against
 * `src/app/pwa/domain/externalFormPwa.ts`, and what stops the notification
 * service worker from quietly turning into a caching one.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const errors = []

const MANIFEST_PATH = join(ROOT, 'public/external-form.webmanifest')
const DOMAIN_PATH = join(ROOT, 'src/app/pwa/domain/externalFormPwa.ts')
const SERVICE_WORKER_PATH = join(ROOT, 'public/admin-notifications-sw.js')
const ADMIN_MANIFEST_PATH = join(ROOT, 'public/admin.webmanifest')
const ADMIN_DOMAIN_PATH = join(ROOT, 'src/app/pwa/domain/adminPwa.ts')

// ── The manifest agrees with the contract the app code depends on ────────────
if (!existsSync(MANIFEST_PATH)) {
  errors.push('[manifest missing] public/external-form.webmanifest')
} else {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const domainSource = readFileSync(DOMAIN_PATH, 'utf8')

  const contractBlock = domainSource.match(
    /EXTERNAL_FORM_MANIFEST_CONTRACT = \{([\s\S]*?)\n\} as const/,
  )
  if (!contractBlock) {
    errors.push('[contract unreadable] EXTERNAL_FORM_MANIFEST_CONTRACT not found in externalFormPwa.ts')
  } else {
    const declared = {}
    for (const [, key, value] of contractBlock[1].matchAll(
      /^\s*(\w+):\s*(?:'([^']*)'|EXTERNAL_FORM_PATH)\s*,/gm,
    )) {
      declared[key] = value ?? '/external-form'
    }

    for (const [key, expected] of Object.entries(declared)) {
      if (manifest[key] !== expected) {
        errors.push(
          `[manifest drift] ${key}: manifest has ${JSON.stringify(manifest[key])}, code expects ${JSON.stringify(expected)}`,
        )
      }
    }
  }

  if (manifest.display !== 'standalone') {
    errors.push(`[manifest] display must be "standalone", got ${JSON.stringify(manifest.display)}`)
  }
  if (manifest.start_url !== '/external-form') {
    errors.push(`[manifest] start_url must be "/external-form", got ${JSON.stringify(manifest.start_url)}`)
  }
  if (!manifest.scope || manifest.scope === '/') {
    errors.push('[manifest] scope must be the external-form route family, not the whole admin app')
  }
  if (!manifest.start_url.startsWith(manifest.scope)) {
    errors.push('[manifest] start_url must be within scope')
  }

  const icons = Array.isArray(manifest.icons) ? manifest.icons : []
  for (const size of ['192x192', '512x512']) {
    if (!icons.some((icon) => icon.sizes === size)) {
      errors.push(`[manifest] a ${size} icon is required`)
    }
  }
  for (const icon of icons) {
    if (!existsSync(join(ROOT, 'public', icon.src))) {
      errors.push(`[icon missing] public${icon.src}`)
    }
  }

  // The apple-touch-icon the head tags reference must exist on disk too, or iOS
  // falls back to a screenshot of the page.
  const appleIcon = domainSource.match(/EXTERNAL_FORM_APPLE_TOUCH_ICON = `\$\{ICON_BASE\}(\/[^`]+)`/)
  const iconBase = domainSource.match(/ICON_BASE = '([^']+)'/)
  if (appleIcon && iconBase) {
    const appleIconPath = join(ROOT, 'public', iconBase[1] + appleIcon[1])
    if (!existsSync(appleIconPath)) {
      errors.push(`[icon missing] ${iconBase[1]}${appleIcon[1]}`)
    }
  } else {
    errors.push('[contract unreadable] EXTERNAL_FORM_APPLE_TOUCH_ICON not found in externalFormPwa.ts')
  }
}

// The root-scoped admin install has a separate manifest and icon set.
if (!existsSync(ADMIN_MANIFEST_PATH)) {
  errors.push('[manifest missing] public/admin.webmanifest')
} else {
  const manifest = JSON.parse(readFileSync(ADMIN_MANIFEST_PATH, 'utf8'))
  const domainSource = readFileSync(ADMIN_DOMAIN_PATH, 'utf8')
  const contractBlock = domainSource.match(/ADMIN_MANIFEST_CONTRACT = \{([\s\S]*?)\n\} as const/)
  if (!contractBlock) {
    errors.push('[contract unreadable] ADMIN_MANIFEST_CONTRACT not found in adminPwa.ts')
  } else {
    for (const [, key, expected] of contractBlock[1].matchAll(/^\s*(\w+):\s*'([^']*)'\s*,/gm)) {
      if (manifest[key] !== expected) {
        errors.push(`[admin manifest drift] ${key}: manifest has ${JSON.stringify(manifest[key])}, code expects ${JSON.stringify(expected)}`)
      }
    }
  }
  if (manifest.id !== '/' || manifest.scope !== '/' || manifest.start_url !== '/' || manifest.display !== 'standalone') {
    errors.push('[admin manifest] root id, scope, start_url and standalone display are required')
  }
  if ('orientation' in manifest) errors.push('[admin manifest] orientation must be omitted')
  const requiredIcons = [
    ['/pwa/admin/icon-192.png', '192x192', 'any'],
    ['/pwa/admin/icon-512.png', '512x512', 'any'],
    ['/pwa/admin/maskable-512.png', '512x512', 'maskable'],
  ]
  for (const [src, sizes, purpose] of requiredIcons) {
    if (!manifest.icons?.some((icon) => icon.src === src && icon.sizes === sizes && icon.purpose === purpose && icon.type === 'image/png')) {
      errors.push(`[admin manifest] missing ${sizes} ${purpose} icon ${src}`)
    }
    if (!existsSync(join(ROOT, 'public', src))) errors.push(`[icon missing] public${src}`)
  }
  if (!existsSync(join(ROOT, 'public/pwa/admin/apple-touch-icon-180.png'))) {
    errors.push('[icon missing] public/pwa/admin/apple-touch-icon-180.png')
  }
}

// ── The notification service worker stays a notification service worker ──────
if (!existsSync(SERVICE_WORKER_PATH)) {
  errors.push('[service worker missing] public/admin-notifications-sw.js')
} else {
  const source = readFileSync(SERVICE_WORKER_PATH, 'utf8')

  if (/addEventListener\(\s*["']fetch["']/.test(source)) {
    errors.push(
      '[service worker] a fetch handler would make the installed form cache-first; it must keep loading the live deployment',
    )
  }
  if (/\bcaches\b/.test(source)) {
    errors.push('[service worker] the Cache API must not be used: no offline/application caching in this phase')
  }
  for (const handler of ['push', 'notificationclick']) {
    if (!new RegExp(`addEventListener\\(\\s*["']${handler}["']`).test(source)) {
      errors.push(`[service worker] the ${handler} handler must be preserved`)
    }
  }
}

// A second root-scope service worker would compete with the notification one.
const rootServiceWorkers = ['public/sw.js', 'public/service-worker.js', 'public/pwa-sw.js']
for (const candidate of rootServiceWorkers) {
  if (existsSync(join(ROOT, candidate))) {
    errors.push(`[service worker] ${candidate} would compete for root scope with admin-notifications-sw.js`)
  }
}

if (errors.length > 0) {
  console.error('External-form PWA checks failed:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('External-form and admin PWA checks passed.')
