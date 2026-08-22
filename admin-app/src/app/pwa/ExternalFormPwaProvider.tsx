import { useExternalFormPwaHead } from './useExternalFormPwaHead'
import { useStandaloneContainment } from './useStandaloneContainment'

/**
 * The single mount point for route-aware install metadata.
 *
 * Renders nothing; it exists so the head and containment effects have exactly
 * one owner inside the router.
 */
export function ExternalFormPwaProvider() {
  useExternalFormPwaHead()
  useStandaloneContainment()

  return null
}
