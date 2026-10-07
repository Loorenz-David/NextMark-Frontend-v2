import type { CSSProperties } from 'react'

/** Glass surface shared by the edge fold tabs (plan and map). */
export const FOLD_TAB_SURFACE_STYLE: CSSProperties = {
  backgroundColor: 'rgba(var(--theme-surface-workspace-r),0.78)',
  border: '1px solid var(--rule)',
  boxShadow: 'var(--shadow-panel-notice)',
  backdropFilter: 'blur(18px) saturate(120%)',
  WebkitBackdropFilter: 'blur(18px) saturate(120%)',
}
