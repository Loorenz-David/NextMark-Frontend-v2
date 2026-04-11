import { useCallback, useEffect, useState } from 'react'

type InstallOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: InstallOutcome
    platform: string
  }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  return (window.navigator as NavigatorWithStandalone).standalone === true
}

export function usePwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode())
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)')

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstallPromptEvent(null)
      setIsInstalled(true)
      setIsInstalling(false)
    }

    const handleDisplayModeChange = () => {
      setIsInstalled(isStandaloneMode())
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    handleDisplayModeChange()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent || isInstalling) {
      return
    }

    setIsInstalling(true)

    try {
      await installPromptEvent.prompt()
      const choice = await installPromptEvent.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPromptEvent(null)
    } finally {
      setIsInstalling(false)
    }
  }, [installPromptEvent, isInstalling])

  return {
    canInstall: !isInstalled && installPromptEvent !== null,
    isInstalling,
    promptInstall,
  }
}
