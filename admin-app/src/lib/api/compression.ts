import { gzip } from 'pako'

const textEncoder = new TextEncoder()

export const MAX_COMPRESSED_BYTES = 512 * 1024
export const MAX_DECOMPRESSED_BYTES = 5 * 1024 * 1024

export function serializePayload(payload: unknown): {
  json: string
  bytes: Uint8Array
} {
  const json = JSON.stringify(payload)
  const bytes = textEncoder.encode(json)

  return { json, bytes }
}

export function gzipPayload(bytes: Uint8Array): Uint8Array {
  return gzip(bytes)
}
