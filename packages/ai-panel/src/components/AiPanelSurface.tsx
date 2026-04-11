import { useState, type PointerEvent as ReactPointerEvent } from 'react'

import { AiPanelComposer } from './AiPanelComposer'
import { AiPanelBlockingInteraction } from './AiPanelBlockingInteraction'
import { AiPanelHeader } from './AiPanelHeader'
import { AiPanelTranscript } from './AiPanelTranscript'
import { mobileHandleStyle, mobileSheetStyle, panelShellStyle } from '../styles'
import type {
  AiActionDescriptor,
  AIInteraction,
  AiPanelMessage,
  AiPanelProviderProps,
  AiPanelTheme,
} from '../types'

function getBlockingInteraction(messages: AiPanelMessage[]): AIInteraction | null {
  const last = messages[messages.length - 1]
  if (!last?.interactions?.length) {
    return null
  }

  return last.interactions.find((interaction) => (
    interaction.kind === 'question' || interaction.kind === 'confirm'
  )) ?? null
}

interface SharedSurfaceProps {
  title: string
  subtitle: string
  placeholder: string
  messages: AiPanelMessage[]
  mapLegacyDataToBlocks?: AiPanelProviderProps['mapLegacyDataToBlocks']
  renderBlock?: AiPanelProviderProps['renderBlock']
  composerValue: string
  isLoading: boolean
  loadingStatusText?: string
  capabilityMode?: AiPanelProviderProps['transport'] extends never ? never : 'auto' | 'manual'
  selectedCapabilityId?: string
  capabilityOptions?: NonNullable<AiPanelProviderProps['capabilityOptions']>
  activeActionId: string | null
  theme: AiPanelTheme
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  diagnostics?: AiPanelProviderProps['diagnostics']
  onComposerChange: (value: string) => void
  onCapabilitySelectionChange?: (value: string) => void
  onClose: () => void
  onClear: () => void
  onRetry: () => Promise<void>
  onSend: () => Promise<void>
  runAction: (action: AiActionDescriptor) => Promise<void>
}

interface DesktopPanelProps extends SharedSurfaceProps {
  size: { width: number; height: number }
  position: { x: number; y: number }
  isDragging: boolean
  onDragStart: (event: ReactPointerEvent<HTMLElement>) => void
}

export function DesktopPanel({
  size,
  position,
  isDragging,
  onDragStart,
  ...surfaceProps
}: DesktopPanelProps) {
  const [isHoveringPanel, setIsHoveringPanel] = useState(false)
  const headerVisible = isHoveringPanel || isDragging
  const blockingInteraction = getBlockingInteraction(surfaceProps.messages)
  const closeDisabled = Boolean(blockingInteraction?.required)
  const clearDisabled = surfaceProps.isLoading || surfaceProps.messages.length === 0

  return (
    <section
      aria-label="AI companion panel"
      onMouseEnter={() => setIsHoveringPanel(true)}
      onMouseLeave={() => setIsHoveringPanel(false)}
      style={{
        ...panelShellStyle(surfaceProps.theme),
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
      }}
    >
      <AiPanelHeader
        closeDisabled={closeDisabled}
        closeDisabledReason={closeDisabled ? 'Answer the required interaction before closing this panel.' : undefined}
        clearDisabled={clearDisabled}
        mobile={false}
        onClear={surfaceProps.onClear}
        onClose={surfaceProps.onClose}
        onDragStart={onDragStart}
        theme={surfaceProps.theme}
        visible={headerVisible}
      />
      <AiPanelTranscript {...surfaceProps} />
      {blockingInteraction ? (
        <AiPanelBlockingInteraction
          interaction={blockingInteraction}
          isLoading={surfaceProps.isLoading}
          runAction={surfaceProps.runAction}
          theme={surfaceProps.theme}
        />
      ) : (
        <AiPanelComposer
          capabilityMode={surfaceProps.capabilityMode}
          capabilityOptions={surfaceProps.capabilityOptions}
          disabled={surfaceProps.isLoading}
          onChange={surfaceProps.onComposerChange}
          onCapabilitySelectionChange={surfaceProps.onCapabilitySelectionChange}
          onSubmit={surfaceProps.onSend}
          placeholder={surfaceProps.placeholder}
          selectedCapabilityId={surfaceProps.selectedCapabilityId}
          theme={surfaceProps.theme}
          value={surfaceProps.composerValue}
        />
      )}
    </section>
  )
}

type MobileSheetProps = SharedSurfaceProps

export function MobileSheet(surfaceProps: MobileSheetProps) {
  const blockingInteraction = getBlockingInteraction(surfaceProps.messages)
  const closeDisabled = Boolean(blockingInteraction?.required)
  const clearDisabled = surfaceProps.isLoading || surfaceProps.messages.length === 0

  return (
    <section aria-label="AI companion panel" style={mobileSheetStyle(surfaceProps.theme)}>
      <div style={mobileHandleStyle(surfaceProps.theme)} />
      <AiPanelHeader
        closeDisabled={closeDisabled}
        closeDisabledReason={closeDisabled ? 'Answer the required interaction before closing this panel.' : undefined}
        clearDisabled={clearDisabled}
        mobile={true}
        onClear={surfaceProps.onClear}
        onClose={surfaceProps.onClose}
        theme={surfaceProps.theme}
        visible={true}
      />
      <AiPanelTranscript {...surfaceProps} />
      {blockingInteraction ? (
        <AiPanelBlockingInteraction
          interaction={blockingInteraction}
          isLoading={surfaceProps.isLoading}
          runAction={surfaceProps.runAction}
          theme={surfaceProps.theme}
        />
      ) : (
        <AiPanelComposer
          capabilityMode={surfaceProps.capabilityMode}
          capabilityOptions={surfaceProps.capabilityOptions}
          disabled={surfaceProps.isLoading}
          onChange={surfaceProps.onComposerChange}
          onCapabilitySelectionChange={surfaceProps.onCapabilitySelectionChange}
          onSubmit={surfaceProps.onSend}
          placeholder={surfaceProps.placeholder}
          selectedCapabilityId={surfaceProps.selectedCapabilityId}
          theme={surfaceProps.theme}
          value={surfaceProps.composerValue}
        />
      )}
    </section>
  )
}
