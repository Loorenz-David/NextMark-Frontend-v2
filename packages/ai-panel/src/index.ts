// ─── Runtime UI ──────────────────────────────────────────────────────────────
// Mount AiPanelProvider in the app shell.
// Use useAiPanel() inside the tree. Use AiPanelLauncher as a manual trigger.
export { AiPanelLauncher, AiPanelProvider, useAiPanel } from './AiPanelProvider'

// ─── Host Contract ───────────────────────────────────────────────────────────
// Everything a host application must implement. See src/host-contract.ts for
// the full annotated integration guide.
export type {
  AiMessageContext,
  AiTransportAdapter,
  AiActionHandler,
  AiActionDescriptor,
  AiMessageBlock,
  AiBlockKind,
  AiBlockEntityType,
  AiBlockLayout,
  AiLegacyDataToBlocksMapper,
  AiBlockRenderer,
  AiBlockRendererProps,
  AiPanelConfig,
  AiPanelProviderProps,
  AiPanelController,
  AiPanelLauncherProps,
} from './host-contract'

// ─── Message & Response Types ─────────────────────────────────────────────────
// Useful when implementing transport adapters and response mappers.
export type {
  AiPanelMessage,
  AiPanelResponse,
  AiThreadState,
  AiToolTraceEntry,
  AiToolTraceResult,
  AiProposalMeta,
  AiProposalErrorCode,
  AiNarrativeIntent,
  AiNarrativePolicy,
  AiRenderingHints,
  AiTypedWarning,
  AiPanelTheme,
  AiCapabilityMode,
  AiCapabilityOption,
  AiPanelMetric,
  AiPanelMetricName,
  AiPanelDiagnosticsConfig,
  AiMessageRole,
  AiToolTraceStatus,
  AiActionVariant,
  AiAnalyticsMetricTrend,
  AiAnalyticsMetricEmphasis,
  AiAnalyticsValueType,
  AiAnalyticsSourceKind,
  AiAnalyticsMetric,
  AiAnalyticsBarItem,
  AiAnalyticsTableColumn,
  AiAnalyticsTableRow,
  AiAnalyticsMetricGridData,
  AiAnalyticsBarListData,
  AiAnalyticsTableData,
  AiAnalyticsBlockData,
  AiMessageBlockMeta,
  AIInteraction,
  AiInteractionKind,
  AiInteractionResponseMode,
  AiInteractionOption,
  AiInteractionField,
  AiInteractionFieldType,
  AiInteractionFieldValidation,
  AiInteractionValidationPattern,
} from './types'

// ─── Interaction Hooks ────────────────────────────────────────────────────────
export { useThreadInteractions } from './hooks/useThreadInteractions'
export type { ThreadInteractionState } from './hooks/useThreadInteractions'
