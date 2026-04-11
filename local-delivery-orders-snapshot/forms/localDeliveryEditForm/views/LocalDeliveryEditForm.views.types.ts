import type { ReactNode } from 'react'

export type LocalDeliveryEditFormHeaderModel = {
  title: ReactNode
  subtitle?: ReactNode
  variant?: string | null
  optimizationDate?: string | null
}

export type LocalDeliveryEditFormViewProps = {
  header: LocalDeliveryEditFormHeaderModel
  onClose: () => void
}
