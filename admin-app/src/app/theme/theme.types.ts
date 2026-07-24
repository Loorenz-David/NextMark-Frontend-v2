export const THEME_STORAGE_KEY = 'beyo.admin.theme'
export const THEMES = ['dark', 'light'] as const

export type ThemeName = (typeof THEMES)[number]

export const DEFAULT_THEME: ThemeName = 'dark'

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === 'string' && THEMES.some((theme) => theme === value)
