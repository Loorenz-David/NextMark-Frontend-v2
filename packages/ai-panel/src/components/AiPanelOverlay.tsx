import type { PointerEvent as ReactPointerEvent } from 'react'

import { FloatingLauncher } from './AiPanelLauncher'
import { DesktopPanel, MobileSheet } from './AiPanelSurface'
import type {
  AiActionDescriptor,
  AiPanelMessage,
  AiPanelProviderProps,
  AiPanelTheme,
} from '../types'

interface AiPanelOverlayProps {
  isOpen: boolean
  isMobile: boolean
  isDragging: boolean
  launcherLabel: string
  title: string
  subtitle: string
  placeholder: string
  messages: AiPanelMessage[]
  composerValue: string
  isLoading: boolean
  loadingStatusText?: string
  capabilityMode?: 'auto' | 'manual'
  selectedCapabilityId?: string
  capabilityOptions?: NonNullable<AiPanelProviderProps['capabilityOptions']>
  activeActionId: string | null
  theme: AiPanelTheme
  desktopSize: { width: number; height: number }
  panelPosition: { x: number; y: number }
  launcherPosition: { x: number; y: number }
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  diagnostics?: AiPanelProviderProps['diagnostics']
  mapLegacyDataToBlocks?: AiPanelProviderProps['mapLegacyDataToBlocks']
  renderBlock?: AiPanelProviderProps['renderBlock']
  onComposerChange: (value: string) => void
  onCapabilitySelectionChange?: (value: string) => void
  onClose: () => void
  onOpen: () => void
  onClear: () => void
  onRetry: () => Promise<void>
  onSend: () => Promise<void>
  onDragStart: (target: 'panel' | 'launcher') => (event: ReactPointerEvent<HTMLElement>) => void
  runAction: (action: AiActionDescriptor) => Promise<void>
}

export function AiPanelOverlay({
  isOpen,
  isMobile,
  isDragging,
  launcherLabel,
  title,
  subtitle,
  placeholder,
  messages,
  composerValue,
  isLoading,
  loadingStatusText,
  capabilityMode,
  selectedCapabilityId,
  capabilityOptions,
  activeActionId,
  theme,
  desktopSize,
  panelPosition,
  launcherPosition,
  renderEmptyState,
  diagnostics,
  mapLegacyDataToBlocks,
  renderBlock,
  onComposerChange,
  onCapabilitySelectionChange,
  onClose,
  onOpen,
  onClear,
  onRetry,
  onSend,
  onDragStart,
  runAction,
}: AiPanelOverlayProps) {
  if (!isOpen) {
    return (
      <FloatingLauncher
        label={launcherLabel}
        onDragStart={onDragStart('launcher')}
        onOpen={onOpen}
        position={launcherPosition}
        theme={theme}
      />
    )
  }

  const sharedSurfaceProps = {
    title,
    subtitle,
    placeholder,
    messages,
    composerValue,
    isLoading,
    loadingStatusText,
    capabilityMode,
    selectedCapabilityId,
    capabilityOptions,
    activeActionId,
    theme,
    renderEmptyState,
    diagnostics,
    mapLegacyDataToBlocks,
    renderBlock,
    onComposerChange,
    onCapabilitySelectionChange,
    onClose,
    onClear,
    onRetry,
    onSend,
    runAction,
  }

  if (isMobile) {
    return <MobileSheet {...sharedSurfaceProps} />
  }

  return (
    <DesktopPanel
      {...sharedSurfaceProps}
      isDragging={isDragging}
      onDragStart={onDragStart('panel')}
      position={panelPosition}
      size={desktopSize}
    />
  )
}
