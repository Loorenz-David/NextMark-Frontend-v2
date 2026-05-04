import type { Coordinates } from '../types'

export type Route = {
  path: string | Coordinates[] | string[] 
  fitBounds?: boolean
}
