import type { GoogleMapsClient } from './types'

let googleMapsPromise: Promise<GoogleMapsClient> | null = null

const MAPS_API_URL = 'https://maps.googleapis.com/maps/api/js'

export function loadGoogleMaps(): Promise<GoogleMapsClient> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser.'))
  }

  if (window.google?.maps?.Map || window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google)
  }

  if (!googleMapsPromise) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

    if (!apiKey) {
      return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_KEY environment variable.'))
    }

    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = Array.from(document.querySelectorAll<HTMLScriptElement>('script')).find((script) =>
        script.src.includes(MAPS_API_URL),
      )

      if (existingScript?.dataset.loaded) {
        resolve(window.google as GoogleMapsClient)
        return
      }

      const script = existingScript ?? document.createElement('script')
      const params = new URLSearchParams({
        key: apiKey,
        libraries: 'places,marker,geometry,drawing',
        v: 'weekly',
        loading: 'async',
      })

      script.src = `${MAPS_API_URL}?${params.toString()}`
      script.async = true
      script.defer = true

      script.addEventListener('load', () => {
        script.dataset.loaded = 'true'
        const settle = () => {
          if (window.google?.maps?.Map || window.google?.maps?.importLibrary) {
            resolve(window.google)
            return true
          }
          return false
        }

        if (settle()) {
          return
        }

        let attempts = 0
        const interval = window.setInterval(() => {
          attempts += 1
          if (settle() || attempts > 30) {
            window.clearInterval(interval)
            if (attempts > 30) {
              reject(new Error('Google Maps loaded without the Maps library.'))
            }
          }
        }, 100)
      })

      script.addEventListener('error', () => {
        reject(new Error('Failed to load Google Maps script.'))
      })

      if (!existingScript) {
        document.head.appendChild(script)
      }
    })
  }

  return googleMapsPromise
}
