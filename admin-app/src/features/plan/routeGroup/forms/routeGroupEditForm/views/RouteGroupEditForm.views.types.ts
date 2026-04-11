import type { ReactNode } from 'react'

export type RouteGroupEditFormHeaderModel = {
  title: ReactNode
  subtitle?: ReactNode
  variant?: string | null
  optimizationDate?: string | null
}

export type RouteGroupEditFormViewProps = {
  header: RouteGroupEditFormHeaderModel
  onClose: () => void
}
