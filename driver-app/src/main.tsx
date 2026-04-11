import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './animation.css'
import './index.css'

if ('serviceWorker' in navigator) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    let hasReloadedForUpdate = false

    const reloadForUpdate = () => {
      if (hasReloadedForUpdate) {
        return
      }

      hasReloadedForUpdate = true
      window.location.reload()
    }

    const triggerServiceWorkerUpdateCheck = () => {
      void navigator.serviceWorker.getRegistration().then((registration) => {
        void registration?.update()
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', reloadForUpdate)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        triggerServiceWorkerUpdateCheck()
      }
    })

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        void updateSW(true)
      },
      onRegisteredSW() {
        triggerServiceWorkerUpdateCheck()
      },
      onRegisterError(error) {
        console.error('Service worker registration failed', error)
      },
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
