import type { ReactNode } from 'react'

export type AiMessageRole = 'user' | 'assistant' | 'status' | 'error'

export type AiCapabilityMode = 'auto' | 'manual'

export interface AiCapabilityOption {
  id: string
  label: string
}

/**
 * Base context shape sent alongside user messages.
 * Host applications may extend this with app-specific fields.
 *
 * @example
 * type AdminContext = AiMessageContext & { app_scope: 'admin'; userId: string }
 */
export interface AiMessageContext {
  /** The frontend route active when the message is sent. */
  route?: string
  capability_mode?: AiCapabilityMode
  capability_id?: string
  [key: string]: unknown
}

export type AiActionVariant = 'primary' | 'secondary' | 'ghost'

export type AiBlockKind = 
  | 'entity_detail' 
  | 'entity_collection' 
  | 'summary' 
  | 'stat' 
  | 'analytics'
  | 'analytics_kpi'
  | 'analytics_trend'
  | 'analytics_breakdown'

export type AiBlockEntityType = 'order' | 'route' | 'plan' | 'client' | 'driver' | 'generic' | 'analytics'

export type AiBlockLayout = 'card' | 'cards' | 'list' | 'table' | 'chips' | 'key_value' | 'metric_grid' | 'bar_list'

export type AiAnalyticsMetricTrend = 'up' | 'down' | 'flat'

export type AiAnalyticsMetricEmphasis = 'default' | 'positive' | 'warning' | 'critical'

export type AiAnalyticsValueType =
  | 'number'
  | 'integer'
  | 'percent'
  | 'currency'
  | 'duration_seconds'
  | 'duration_minutes'
  | string

export type AiAnalyticsSourceKind =
  | 'analytics'
  | 'analytics_kpi'
  | 'analytics_trend'
  | 'analytics_breakdown'
  | string

export interface AiMessageBlockMeta extends Record<string, unknown> {
  schemaVersion?: number
  sourceKind?: AiAnalyticsSourceKind
  direction?: string
  confidenceScore?: number
}

export interface AiAnalyticsMetric {
  id: string
  label: string
  value?: number | string
  displayValue?: string
  description?: string
  hint?: string
  changeLabel?: string
  trend?: AiAnalyticsMetricTrend
  emphasis?: AiAnalyticsMetricEmphasis
  valueType?: AiAnalyticsValueType
  unit?: string
}

export interface AiAnalyticsBarItem {
  id: string
  label: string
  value: number
  displayValue?: string
  hint?: string
  color?: string
}

export interface AiAnalyticsTableColumn {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
}

export interface AiAnalyticsTableRow {
  id?: string
  [key: string]: unknown
}

export interface AiAnalyticsMetricGridData {
  metrics: AiAnalyticsMetric[]
}

export interface AiAnalyticsBarListData {
  items: AiAnalyticsBarItem[]
}

export interface AiAnalyticsTableData {
  columns: AiAnalyticsTableColumn[]
  rows: AiAnalyticsTableRow[]
}

export type AiAnalyticsBlockData = AiAnalyticsMetricGridData | AiAnalyticsBarListData | AiAnalyticsTableData

export interface AiActionDescriptor<TPayload = unknown> {
  id?: string
  type: string
  label: string
  payload?: TPayload
  hint?: string
  disabled?: boolean
  loading?: boolean
  variant?: AiActionVariant
}

export type AiInteractionKind = 'ui_action' | 'continue_prompt' | 'question' | 'confirm'

export type AiInteractionResponseMode = 'free_text' | 'select' | 'confirm' | 'form'

export type AiInteractionFieldType =
  | 'text'
  | 'textarea'
  | 'phone'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'boolean'

export type AiInteractionValidationPattern = 'phone' | 'email' | 'postal_code'

export interface AiInteractionOption {
  id: string
  label: string
}

export interface AiInteractionFieldValidation {
  pattern?: AiInteractionValidationPattern
  min?: number
  max?: number
  max_length?: number
}

export interface AiInteractionField {
  id: string
  label: string
  type: AiInteractionFieldType
  required?: boolean
  placeholder?: string
  help_text?: string
  default_value?: string | number | boolean | null
  options?: AiInteractionOption[]
  suggestions?: AiInteractionOption[]
  validation?: AiInteractionFieldValidation
}

export interface AIInteraction<TPayload = unknown> {
  id?: string
  kind: AiInteractionKind
  label: string
  payload?: TPayload
  hint?: string
  required?: boolean
  disabled?: boolean
  response_mode?: AiInteractionResponseMode
  options?: AiInteractionOption[]
  fields?: AiInteractionField[]
}

export type AiToolTraceStatus = 'success' | 'error' | 'info'

export type AiProposalErrorCode =
  | 'proposal_expired'
  | 'proposal_cancelled'
  | 'proposal_already_applied'
  | 'proposal_conflict'
  | 'proposal_invalid_state'
  | 'bad_request'
  | 'VALIDATION_ERROR'
  | 'tool_execution_failed'
  | 'DELIVERY_WINDOW_PAST_TIME'
  | 'DELIVERY_WINDOW_OVERLAP'
  | 'DELIVERY_WINDOW_LIMIT_EXCEEDED'
  | string

export interface AiProposalMeta {
  status?: string
  created_at?: string
  expires_at?: string
  version?: string | number
  applied_at?: string
}

export interface AiToolTraceResult {
  error_code?: AiProposalErrorCode
  error?: string
  proposal?: {
    meta?: AiProposalMeta
    [key: string]: unknown
  }
  proposal_meta?: AiProposalMeta
  [key: string]: unknown
}

export interface AiToolTraceEntry {
  id?: string
  tool: string
  status?: AiToolTraceStatus
  summary?: string
  params?: Record<string, unknown>
  result?: AiToolTraceResult | unknown
  errorCode?: AiProposalErrorCode
  errorMessage?: string
  proposalMeta?: AiProposalMeta
}

export type AiNarrativeIntent = 'summary_with_blocks' | 'blocks_only' | 'narrative_only' | string

export type AiNarrativePolicy = 'no_enumeration' | 'full_enumeration' | 'key_highlights' | string

export interface AiRenderingHints {
  has_blocks?: boolean
  suppress_raw_data_preview?: boolean
  text_section_title?: string
  block_section_title?: string
}

export type AiPanelMetricName =
  | 'conversation:thread_load'
  | 'conversation:append_message'
  | 'conversation:poll_status'
  | 'transcript:load_older'
  | 'transcript:render_window'

export interface AiPanelMetric {
  name: AiPanelMetricName
  timestamp: number
  detail: Record<string, unknown>
}

export interface AiPanelDiagnosticsConfig {
  enabled?: boolean
  emitToConsole?: boolean
  onMetric?: (metric: AiPanelMetric) => void
}

export interface AiTypedWarning {
  code: string
  message: string
  meta?: Record<string, unknown>
}

export interface AiMessageBlock {
  id?: string
  kind: AiBlockKind
  entityType?: AiBlockEntityType
  layout?: AiBlockLayout
  title?: string
  subtitle?: string
  data: unknown
  actions?: AiActionDescriptor[]
  meta?: AiMessageBlockMeta
  interactions?: AIInteraction[]
}

export interface AiBlockRendererProps {
  block: AiMessageBlock
  message: AiPanelMessage
  theme: AiPanelTheme
  activeActionId: string | null
  onAction: (action: AiActionDescriptor) => Promise<void>
}

export interface AiPanelMessage {
  id: string
  role: AiMessageRole
  content: string
  createdAt: number
  statusLabel?: string
  intent?: AiNarrativeIntent
  narrativePolicy?: AiNarrativePolicy
  renderingHints?: AiRenderingHints
  typedWarnings?: AiTypedWarning[]
  blocks?: AiMessageBlock[]
  actions?: AiActionDescriptor[]
  toolTrace?: AiToolTraceEntry[]
  data?: unknown
  interactions?: AIInteraction[]
}

export interface AiThreadState {
  threadId: string
  messages: AiPanelMessage[]
}

export interface AiPanelResponse {
  threadId: string
  message: {
    role?: Extract<AiMessageRole, 'assistant' | 'status' | 'error'>
    content: string
    statusLabel?: string
    intent?: AiNarrativeIntent
    narrativePolicy?: AiNarrativePolicy
    renderingHints?: AiRenderingHints
    typedWarnings?: AiTypedWarning[]
    blocks?: AiMessageBlock[]
    actions?: AiActionDescriptor[]
    toolTrace?: AiToolTraceEntry[]
    data?: unknown
    interactions?: AIInteraction[]
  }
}

export interface AiTransportAdapter {
  createThread: () => Promise<{ threadId: string }>
  sendMessage: (request: {
    threadId: string
    message: string
    context?: AiMessageContext
    narrative_policy?: AiNarrativePolicy
    __interaction_response__?: string
    confirm_accepted?: boolean
    interaction_form?: Record<string, unknown>
  }) => Promise<AiPanelResponse>
  loadThread?: (threadId: string) => Promise<AiThreadState>
  pollLoadingStatus?: (request: {
    threadId: string
    lastMessage?: string
  }) => Promise<{
    message?: string
  }>
}

export type AiActionHandler = (action: AiActionDescriptor) => void | Promise<void>

export type AiLegacyDataToBlocksMapper = (data: unknown) => AiMessageBlock[] | null

export type AiBlockRenderer = (props: AiBlockRendererProps) => ReactNode | null

export interface AiPanelTheme {
  accent: string
  background: string
  surface: string
  surfaceAlt: string
  text: string
  muted: string
  border: string
  shadow: string
  fontFamily?: string
  composer: {
    background: string
    border: string
    text: string
    placeholderText: string
    shadow: string
    fontFamily?: string
    muted?: string
    accent?: string
  }
  launcher:{
    launcherAccent: string
    border: string
    text: string
    fontSize: number
    fontWeight: number
    shadow: string
    background: string
    fontFamily?: string
    accent?: string
  }
  header: {
    backgroundColor: string
    border: string
    text: string
    placeholderText: string
    shadow: string
    fontFamily?: string
    muted?: string
    accent?: string 
  }
}

export interface AiPanelConfig {
  title?: string
  subtitle?: string
  placeholder?: string
  storageKey?: string
  maxMessages?: number
  diagnostics?: AiPanelDiagnosticsConfig
  capabilityOptions?: AiCapabilityOption[]
  mobileBreakpoint?: number
  viewportMargin?: number
  defaultOpen?: boolean
  desktopSize?: {
    width: number
    height: number
  }
  launcherLabel?: string
  theme?: Partial<AiPanelTheme>
  renderEmptyState?: ReactNode
  mapLegacyDataToBlocks?: AiLegacyDataToBlocksMapper
  renderBlock?: AiBlockRenderer
}

export interface AiPanelProviderProps extends AiPanelConfig {
  children: ReactNode
  transport: AiTransportAdapter
  resolveAction?: AiActionHandler
}

export interface AiPanelController {
  isOpen: boolean
  isLoading: boolean
  threadId: string | null
  messages: AiPanelMessage[]
  open: () => void
  close: () => void
  toggle: () => void
  clearConversation: () => void
  retryLast: () => Promise<void>
  send: (message?: string, context?: AiMessageContext) => Promise<void>
}

export interface AiPanelLauncherProps {
  label?: string
}
