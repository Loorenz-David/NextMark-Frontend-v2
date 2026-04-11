import type { ReactNode } from 'react'

export type FeaturePopupSize = 'sm' | 'md' | 'lg' | 'full' | 'mdNoHeight'
export type FeaturePopupVariant = 'center' | 'side' | 'fullscreen'

export type FeaturePopupShellProps = {
  children: ReactNode
  onRequestClose: () => void
  size?: FeaturePopupSize
  variant?: FeaturePopupVariant
}

export type FeaturePopupHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  onClose?: () => void
  actions?: ReactNode
}

export type UseFeaturePopupCloseControllerInput = {
  hasUnsavedChanges: boolean
  onClose?: () => void
  canClose?: () => boolean | Promise<boolean>
}

export type FeaturePopupCloseState = 'idle' | 'confirming'

export type PopupCloseController = {
  closeState: FeaturePopupCloseState
  hasUnsavedChanges: boolean
  requestClose: () => void
  confirmClose: () => Promise<void>
  cancelClose: () => void
}
