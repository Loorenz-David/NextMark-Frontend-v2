export {}

declare global {
  namespace google {
    namespace maps {
      namespace geometry {
        namespace spherical {
          function computeDistanceBetween(from: any, to: any): number
        }

        namespace poly {
          function containsLocation(point: google.maps.LatLng, polygon: any): boolean
        }

        namespace encoding {
          function decodePath(encodedPath: string): google.maps.LatLng[]
        }
      }

      interface LatLngLiteral {
        lat: number
        lng: number
      }

      interface MapTypeStyle {
        featureType?: string
        elementType?: string
        stylers?: Array<Record<string, unknown>>
      }

      enum ControlPosition {
        BOTTOM_CENTER,
        BOTTOM_LEFT,
        BOTTOM_RIGHT,
        LEFT_BOTTOM,
        LEFT_CENTER,
        LEFT_TOP,
        RIGHT_BOTTOM,
        RIGHT_CENTER,
        RIGHT_TOP,
        TOP_CENTER,
        TOP_LEFT,
        TOP_RIGHT,
      }

      class MVCArray<T> {
        push(item: T): number
        removeAt(index: number): T
        getArray(): T[]
      }

      interface MapOptions {
        center?: LatLngLiteral
        zoom?: number
        disableDefaultUI?: boolean
        mapId?: string
        styles?: MapTypeStyle[]
        zoomControl?: boolean
        mapTypeControl?: boolean
        fullscreenControl?: boolean
        streetViewControl?: boolean
      }

      class MapsEventListener {
        remove(): void
      }

      class LatLng {
        constructor(lat: number, lng: number)
        lat(): number
        lng(): number
      }

      class Map {
        constructor(container: HTMLElement, opts?: MapOptions)
        setOptions(options: Partial<MapOptions>): void
        addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener
        getZoom(): number | undefined
        getBounds(): {
          getNorthEast(): LatLng
          getSouthWest(): LatLng
        } | null
        fitBounds(
          bounds: LatLngBounds,
          padding?: {
            top: number
            right: number
            bottom: number
            left: number
          } | number,
        ): void
        setZoom?(zoom: number): void
        getCenter(): google.maps.LatLng | null
        panTo(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void
        setCenter(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void
        controls: Record<ControlPosition, MVCArray<HTMLElement>>
      }

      class Polygon {
        constructor(options: any)
        setMap(map: Map | null): void
      }

      class Polyline {
        constructor(options: any)
        setOptions(options: any): void
        setMap(map: Map | null): void
      }

      class LatLngBounds {
        extend(latLng: LatLngLiteral): void
        isEmpty(): boolean
      }

      interface GeocoderAddressComponent {
        long_name: string
        short_name: string
        types: string[]
      }

      interface GeocoderResult {
        formatted_address?: string
        address_components?: GeocoderAddressComponent[]
      }

      interface GeocoderResponse {
        results?: GeocoderResult[]
      }

      class Geocoder {
        geocode(request: { location: LatLngLiteral }): Promise<GeocoderResponse>
      }

      namespace marker {
        class AdvancedMarkerElement {
          constructor(options: any)
          position: LatLngLiteral | LatLng
          map: Map | null
          content: HTMLElement
          zIndex?: number
          addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener
        }
      }

      namespace event {
        function addListener(instance: any, eventName: string, handler: (...args: any[]) => void): MapsEventListener
        function addListenerOnce(instance: any, eventName: string, handler: (...args: any[]) => void): MapsEventListener
        function clearInstanceListeners(instance: any): void
        function removeListener(listener: MapsEventListener): void
        function trigger(instance: any, eventName: string, ...args: any[]): void
      }

      namespace drawing {
        enum OverlayType {
          CIRCLE,
          RECTANGLE,
          POLYGON,
        }

        class DrawingManager {
          constructor(options?: any)
          setMap(map: Map | null): void
          setDrawingMode(mode: OverlayType | null): void
        }
      }
    }
  }
}
