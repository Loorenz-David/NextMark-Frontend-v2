import { useEffect, type PropsWithChildren } from 'react'

import { useThemeStore } from './theme.store'

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return children
}
