import { useEffect, useRef } from 'react'

export const usePrefersReducedMotionFlow = () => {
  const prefersReducedMotionRef = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = mediaQuery.matches

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotionRef
}
