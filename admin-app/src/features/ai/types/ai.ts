// ---------------------------------------------------------------------------
// V2 Thread-based types (current contract)
// ---------------------------------------------------------------------------

export interface AIThreadCreateResponse {
  thread_id: string
}

export interface AIAction {
  id?: string
  type: 'navigate' | 'apply_order_filters' | 'copy_text' | 'open_settings'
  label: string
  payload?: Record<string, unknown>
  hint?: string
  disabled?: boolean
}

export interface AIToolTraceEntry {
  id: string
  tool: string
  status: 'success' | 'error'
  summary: string
  params: Record<string, unknown>
  result: Record<string, unknown>
}

export interface AIMessageRenderingHints {
  has_blocks?: boolean
  suppress_raw_data_preview?: boolean
  text_section_title?: string
  block_section_title?: string
}

export interface AITypedWarning {
  code: string
  message: string
  meta?: Record<string, unknown>
}

export interface AIBlock {
  id?: string
  kind:
    | 'entity_detail'
    | 'entity_collection'
    | 'summary'
    | 'stat'
    | 'analytics'
    | 'analytics_kpi'
    | 'analytics_trend'
    | 'analytics_breakdown'
  entity_type?: 'order' | 'route' | 'plan' | 'client' | 'driver' | 'generic' | 'analytics'
  layout?: 'card' | 'cards' | 'list' | 'table' | 'chips' | 'key_value' | 'metric_grid' | 'bar_list'
  title?: string
  subtitle?: string
  data: unknown
  actions?: AIAction[]
  meta?: Record<string, unknown>
}

export interface AIThreadTurn {
  id: string
  thread_id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  created_at: string
  tool_name?: string
  tool_params?: Record<string, unknown>
  tool_result?: Record<string, unknown>
  actions?: AIAction[]
  tool_trace?: AIToolTraceEntry[]
  data?: Record<string, unknown>
  status_label?: string
  intent?: string
  narrative_policy?: string
  rendering_hints?: AIMessageRenderingHints
  typed_warnings?: AITypedWarning[]
  blocks?: AIBlock[]
}

export interface AIThreadMessagePayload {
  role: 'assistant' | 'status' | 'error'
  content: string
  status_label?: string
  intent?: string
  narrative_policy?: string
  rendering_hints?: AIMessageRenderingHints
  typed_warnings?: AITypedWarning[]
  blocks?: AIBlock[]
  actions?: AIAction[]
  tool_trace?: AIToolTraceEntry[]
  data?: Record<string, unknown> | null
}

export interface AIThreadMessageResponse {
  thread_id: string
  message: AIThreadMessagePayload
}

export interface AIThreadGetResponse {
  thread_id: string
  messages: AIThreadTurn[]
}

export interface AICreateThreadRequest {
  context?: { route?: string }
}

export interface AIMessageRequest {
  message: string
  context?: Record<string, unknown>
}


