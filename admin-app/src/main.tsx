import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProviders } from './app/providers/AppProviders'

declare const __APP_BUILD_ID__: string
declare const __APP_BUILD_TIMESTAMP__: string

// listener for setting the dynamic height on mobile browsers
function updateVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
}

const buildInfo = {
  buildId: __APP_BUILD_ID__,
  buildTimestamp: __APP_BUILD_TIMESTAMP__,
  mode: import.meta.env.MODE,
  href: window.location.href,
}

const getBootAssetSnapshot = () => ({
  stylesheets: Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'),
  ).map((node) => node.href),
  scripts: Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[src]'),
  ).map((node) => node.src),
})

const logRuntimeAssetIssue = (
  kind: string,
  payload: Record<string, unknown>,
) => {
  console.error(`[runtime-assets] ${kind}`, {
    ...buildInfo,
    ...payload,
    assetSnapshot: getBootAssetSnapshot(),
  })
}

const installRuntimeAssetDiagnostics = () => {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (
        target instanceof HTMLScriptElement ||
        target instanceof HTMLLinkElement
      ) {
        logRuntimeAssetIssue('resource-load-error', {
          tagName: target.tagName,
          source:
            target instanceof HTMLLinkElement ? target.href : target.src,
        })
        return
      }

      logRuntimeAssetIssue('window-error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    },
    true,
  )

  window.addEventListener('unhandledrejection', (event) => {
    const reason =
      event.reason instanceof Error
        ? {
            name: event.reason.name,
            message: event.reason.message,
            stack: event.reason.stack,
          }
        : { value: String(event.reason) }

    logRuntimeAssetIssue('unhandled-rejection', {
      reason,
    })
  })

  if (import.meta.env.PROD) {
    console.info('[app-build]', {
      ...buildInfo,
      assetSnapshot: getBootAssetSnapshot(),
      serviceWorkerControlled:
        typeof navigator !== 'undefined' &&
        typeof navigator.serviceWorker !== 'undefined'
          ? navigator.serviceWorker.controller?.scriptURL ?? null
          : null,
    })
  }

  ;(window as Window & {
    __NEXTMARK_BUILD_INFO__?: typeof buildInfo
  }).__NEXTMARK_BUILD_INFO__ = buildInfo
}

window.addEventListener('resize', updateVH)
updateVH()
installRuntimeAssetDiagnostics()

createRoot(document.getElementById('root')!).render(

    <AppProviders>
      <App />
    </AppProviders>
)
