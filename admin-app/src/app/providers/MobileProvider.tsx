// src/contexts/MobileProvider.tsx
import { useEffect, useMemo, useState } from 'react'
import { MobileContext } from '../contexts/MobileContext'

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1000
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen])

  const value = useMemo(
    () => ({
      isMobile,
      isMenuOpen: isMobileMenuOpen,
      setIsMobileMenuOpen,
      setIsMobile,
    }),
    [isMobile, isMobileMenuOpen]
  )

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}