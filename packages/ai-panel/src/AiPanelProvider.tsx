import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import { AiPanelOverlay } from './components/AiPanelOverlay'
import { DEFAULT_DESKTOP_SIZE, DEFAULT_LAUNCHER_SIZE, DEFAULT_MOBILE_BREAKPOINT, DEFAULT_STORAGE_KEY, DEFAULT_VIEWPORT_MARGIN } from './constants'
import { AiPanelContext, useAiPanel } from './context'
import { useAiPanelConversation } from './hooks/useAiPanelConversation'
import { useAiPanelLayoutState } from './hooks/useAiPanelLayoutState'
import { mergeAiPanelTheme } from './theme'
import { manualLauncherButtonStyle } from './styles'
import type { AiPanelLauncherProps, AiPanelProviderProps } from './types'

export function AiPanelProvider({
  children,
  transport,
  resolveAction,
  title = 'AI Companion',
  subtitle = 'Overlay workspace operator',
  placeholder = 'Ask anything about this app',
  storageKey = DEFAULT_STORAGE_KEY,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  viewportMargin = DEFAULT_VIEWPORT_MARGIN,
  defaultOpen = false,
  desktopSize = DEFAULT_DESKTOP_SIZE,
  launcherLabel = 'AI',
  maxMessages,
  diagnostics,
  capabilityOptions = [],
  theme,
  renderEmptyState,
  mapLegacyDataToBlocks,
  renderBlock,
}: AiPanelProviderProps) {
  const mergedTheme = useMemo(() => mergeAiPanelTheme(theme), [theme])

  const layoutState = useAiPanelLayoutState({
    storageKey,
    viewportMargin,
    mobileBreakpoint,
    desktopSize,
    launcherSize: DEFAULT_LAUNCHER_SIZE,
    defaultOpen,
  })

  const open = () => layoutState.setIsOpen(true)
  const close = () => layoutState.setIsOpen(false)
  const toggle = () => layoutState.setIsOpen((current) => !current)

  const conversationState = useAiPanelConversation({
    transport,
    storageKey,
    maxMessages,
    capabilityOptions,
    resolveAction,
    onOpen: open,
    onClose: close,
    onToggle: toggle,
  })

  const controllerValue = useMemo(
    () => ({
      ...conversationState.controller,
      isOpen: layoutState.isOpen,
    }),
    [conversationState.controller, layoutState.isOpen],
  )

  return (
    <AiPanelContext.Provider value={controllerValue}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <AiPanelOverlay
              activeActionId={conversationState.activeActionId}
              composerValue={conversationState.composerValue}
              capabilityMode={conversationState.capabilityMode}
              capabilityOptions={capabilityOptions}
              desktopSize={desktopSize}
              diagnostics={diagnostics}
              isDragging={layoutState.isDragging}
              isLoading={controllerValue.isLoading}
              isMobile={layoutState.isMobile}
              isOpen={layoutState.isOpen}
              launcherLabel={launcherLabel}
              launcherPosition={layoutState.launcherPosition}
              loadingStatusText={conversationState.loadingStatusText}
              mapLegacyDataToBlocks={mapLegacyDataToBlocks}
              messages={controllerValue.messages}
              onCapabilitySelectionChange={conversationState.setCapabilitySelection}
              onClear={controllerValue.clearConversation}
              onClose={close}
              onComposerChange={conversationState.setComposerValue}
              onDragStart={layoutState.startDrag}
              onOpen={open}
              onRetry={controllerValue.retryLast}
              onSend={() => controllerValue.send()}
              panelPosition={layoutState.panelPosition}
              placeholder={placeholder}
              renderEmptyState={renderEmptyState}
              renderBlock={renderBlock}
              runAction={conversationState.runAction}
              selectedCapabilityId={conversationState.selectedCapabilityId}
              subtitle={subtitle}
              theme={mergedTheme}
              title={title}
            />,
            document.body,
          )
        : null}
    </AiPanelContext.Provider>
  )
}

export function AiPanelLauncher({ label = 'Open AI' }: AiPanelLauncherProps) {
  const { open } = useAiPanel()

  return (
    <button onClick={open} style={manualLauncherButtonStyle} type="button">
      {label}
    </button>
  )
}

export { useAiPanel } from './context'
