import type { ManagedHeadTag } from './managedHead'

export const ADMIN_MANIFEST_PATH = '/admin.webmanifest'
export const ADMIN_APPLE_TOUCH_ICON = '/pwa/admin/apple-touch-icon-180.png'

export const ADMIN_MANIFEST_CONTRACT = {
  id: '/',
  name: 'NextMark Admin',
  short_name: 'NextMark',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#182224',
  theme_color: '#182224',
} as const

export const ADMIN_PWA_HEAD_TAGS: readonly ManagedHeadTag[] = [
  { key: 'manifest', tagName: 'link', attributes: { rel: 'manifest', href: ADMIN_MANIFEST_PATH } },
  { key: 'apple-touch-icon', tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: ADMIN_APPLE_TOUCH_ICON } },
  { key: 'apple-web-app-capable', tagName: 'meta', attributes: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
  { key: 'mobile-web-app-capable', tagName: 'meta', attributes: { name: 'mobile-web-app-capable', content: 'yes' } },
  { key: 'apple-status-bar-style', tagName: 'meta', attributes: { name: 'apple-mobile-web-app-status-bar-style', content: 'default' } },
  { key: 'apple-web-app-title', tagName: 'meta', attributes: { name: 'apple-mobile-web-app-title', content: ADMIN_MANIFEST_CONTRACT.short_name } },
  { key: 'theme-color', tagName: 'meta', attributes: { name: 'theme-color', content: ADMIN_MANIFEST_CONTRACT.theme_color } },
]
