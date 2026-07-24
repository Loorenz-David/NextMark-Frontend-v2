import { create } from 'zustand'

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeName,
  type ThemeName,
} from './theme.types'

type ThemeState = {
  theme: ThemeName
  setTheme: (next: ThemeName) => void
  toggleTheme: () => void
}

const readInitialTheme = (): ThemeName => {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME
  }

  const stampedTheme = document.documentElement.getAttribute('data-theme')
  return isThemeName(stampedTheme) ? stampedTheme : DEFAULT_THEME
}

const persistTheme = (theme: ThemeName): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The document theme still updates when storage is unavailable.
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readInitialTheme(),
  setTheme: (next) => {
    persistTheme(next)
    set({ theme: next })
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return { theme: next }
    })
  },
}))
