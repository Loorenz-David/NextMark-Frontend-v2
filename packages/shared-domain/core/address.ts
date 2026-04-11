export type coordinates = {
  lat: number
  lng: number
}

export type address = {
  street_address: string
  city?: string
  country?: string
  postal_code?: string
  coordinates: coordinates
}
