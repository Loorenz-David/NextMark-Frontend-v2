import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ConnectivityContext } from './connectivity.context'

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value = useMemo(() => ({ isOnline }), [isOnline])
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
}
