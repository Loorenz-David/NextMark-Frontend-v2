import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { copyToClipboard, safeJson } from '../message'
import { renderMarkdown } from '../markdown'
import { resolveProposalUiState, shouldDisableActionForProposalState } from '../proposal'
import {
  actionRowStyle,
  buttonStyle,
  dataPreviewStyle,
  messageBodyStyle,
  messageCardStyle,
  messageFooterStyle,
  messageHeaderStyle,
  traceCodeStyle,
  traceSummaryStyle,
} from '../styles'
import type {
  AiActionDescriptor,
  AiBlockRenderer,
  AiLegacyDataToBlocksMapper,
  AiMessageBlock,
  AiPanelMessage,
  AiPanelTheme,
} from '../types'

interface AiPanelMessageCardProps {
  message: AiPanelMessage
  theme: AiPanelTheme
  activeActionId: string | null
  mapLegacyDataToBlocks?: AiLegacyDataToBlocksMapper
  renderBlock?: AiBlockRenderer
  onAction: (action: AiActionDescriptor) => Promise<void>
}

function getActionRuntimeId(action: AiActionDescriptor): string {
  return action.id ?? `${action.type}-${action.label}`
}

function isActionIdRelevant(message: AiPanelMessage, actionId: string | null): boolean {
  if (!actionId) {
    return false
  }

  if (message.actions?.some((action) => getActionRuntimeId(action) === actionId)) {
    return true
  }

  if (message.blocks?.some((block) => block.actions?.some((action) => getActionRuntimeId(action) === actionId))) {
    return true
  }

  return false
}

function sectionLabelStyle(theme: AiPanelTheme) {
  return {
    color: theme.muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  }
}

const sectionGroupStyle = {
  display: 'grid',
  gap: 8,
}

const TABLE_PREVIEW_LIMIT = 12
const CARD_PREVIEW_LIMIT = 6

function proposalNoticeStyle(theme: AiPanelTheme, tone: 'neutral' | 'warning' | 'success') {
  const palette =
    tone === 'success'
      ? {
          background: 'rgba(52, 108, 73, 0.18)',
          border: 'rgba(119, 196, 147, 0.26)',
          color: theme.text,
        }
      : tone === 'warning'
        ? {
            background: 'rgba(118, 78, 28, 0.18)',
            border: 'rgba(214, 170, 104, 0.26)',
            color: theme.text,
          }
        : {
            background: theme.surfaceAlt,
            border: theme.border,
            color: theme.text,
          }

  return {
    display: 'grid',
    gap: 4,
    padding: '10px 12px',
    borderRadius: 14,
    background: palette.background,
    border: `1px solid ${palette.border}`,
    color: palette.color,
  }
}

function proposalNoticeTone(kind: ReturnType<typeof resolveProposalUiState>['kind']): 'neutral' | 'warning' | 'success' {
  if (kind === 'applied') {
    return 'success'
  }

  if (kind === 'pending_confirm' || kind === 'none') {
    return 'neutral'
  }

  return 'warning'
}

function renderActionButton(
  action: AiActionDescriptor,
  theme: AiPanelTheme,
  activeActionId: string | null,
  proposalState: ReturnType<typeof resolveProposalUiState>,
  onAction: (action: AiActionDescriptor) => Promise<void>,
): ReactNode {
  const actionId = action.id ?? `${action.type}-${action.label}`
  const isRunning = activeActionId === actionId || action.loading
  const proposalGuard = shouldDisableActionForProposalState(action, proposalState)
  const isDisabled = action.disabled || proposalGuard.disabled || isRunning
  const title = proposalGuard.reason ?? action.hint

  return (
    <button
      key={actionId}
      disabled={isDisabled}
      onClick={() => void onAction(action)}
      style={buttonStyle(theme, action.variant ?? 'secondary', isDisabled)}
      title={title}
      type="button"
    >
      {isRunning ? 'Working...' : action.label}
    </button>
  )
}

function toDisplayLabel(key: string): string {
  return key.replace(/_/g, ' ')
}

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    return safeJson(value)
  }

  return String(value)
}

interface AiFocus {
  focus_entity_ids: (string | number)[]
  focus_counts: Record<string, number>
}

function extractAiFocus(data: unknown): AiFocus | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const aiFocus = record.ai_focus
  if (!aiFocus || typeof aiFocus !== 'object') return null
  const focus = aiFocus as Record<string, unknown>
  if (!Array.isArray(focus.focus_entity_ids) || !focus.focus_counts || typeof focus.focus_counts !== 'object') {
    return null
  }
  return {
    focus_entity_ids: focus.focus_entity_ids.map((id) => String(id)),
    focus_counts: focus.focus_counts as Record<string, number>,
  }
}

function isFocusedRow(item: unknown, focus: AiFocus | null): boolean {
  if (!focus) return false
  if (typeof item !== 'object' || !item) return false
  const row = item as Record<string, unknown>
  const itemId = row.id
  if (itemId === null || itemId === undefined) return false
  return focus.focus_entity_ids.includes(String(itemId))
}

function renderFocusLegend(focus: AiFocus, theme: AiPanelTheme): ReactNode {
  const summaries = Object.entries(focus.focus_counts)
    .map(([key, count]) => `${count} ${toDisplayLabel(key)}`)
    .join(' • ')

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '8px 10px',
        background: theme.surfaceAlt,
        borderRadius: 8,
        borderLeft: `3px solid ${theme.accent}`,
        marginBottom: 10,
        color: theme.muted,
        fontSize: 12,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: theme.accent,
          flexShrink: 0,
        }}
      />
      <span>{summaries} highlighted</span>
    </div>
  )
}

function getCollectionColumns(block: AiMessageBlock, firstRow: Record<string, unknown>): string[] {
  const metaColumns = (block.meta as { table?: { columns?: unknown } } | undefined)?.table?.columns

  if (Array.isArray(metaColumns)) {
    const columns = metaColumns
      .filter((column): column is string => typeof column === 'string' && column.length > 0)

    if (columns.length > 0) {
      return columns
    }
  }

  if (block.entityType === 'order') {
    const preferredOrderColumns = [
      'order_scalar_id',
      'status',
      'client_name',
      'reference_number',
      'reference',
      'street_address',
    ]

    const presentPreferredColumns = preferredOrderColumns.filter((column) => column in firstRow)
    if (presentPreferredColumns.length > 0) {
      return presentPreferredColumns
    }
  }

  return Object.keys(firstRow).filter((column) => column !== 'id').slice(0, 6)
}

function renderExpandControl(
  theme: AiPanelTheme,
  expanded: boolean,
  previewCount: number,
  totalCount: number,
  unitLabel: string,
  onToggleExpanded: () => void,
): ReactNode {
  if (totalCount <= previewCount) {
    return null
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button
        onClick={onToggleExpanded}
        style={buttonStyle(theme, 'ghost')}
        type="button"
      >
        {expanded ? `Show fewer ${unitLabel}` : `Show all ${totalCount} ${unitLabel}`}
      </button>
    </div>
  )
}

function renderBlockData(
  block: AiMessageBlock,
  theme: AiPanelTheme,
  expanded: boolean,
  onToggleExpanded: () => void,
): ReactNode {
  const { data } = block
  if (Array.isArray(data)) {
    return (
      <pre style={traceCodeStyle(theme)}>{safeJson(data)}</pre>
    )
  }

  if (!data || typeof data !== 'object') {
    return <div style={traceSummaryStyle(theme)}>{String(data ?? '')}</div>
  }

  const record = data as Record<string, unknown>
  const items = Array.isArray(record.items) ? record.items : null
  const focus = extractAiFocus(data)

  if (items && items.length > 0 && block.layout === 'table' && typeof items[0] === 'object' && items[0] !== null) {
    const firstRow = items[0] as Record<string, unknown>
    const columns = getCollectionColumns(block, firstRow)
    const tableItems = expanded ? items : items.slice(0, TABLE_PREVIEW_LIMIT)

    if (columns.length > 0) {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          {focus ? renderFocusLegend(focus, theme) : null}
          <div style={{ overflowX: 'auto', borderRadius: 10 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              lineHeight: 1.45,
              border: `1px solid ${theme.border}`,
              background: theme.surfaceAlt,
            }}
          >
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderBottom: `1px solid ${theme.border}`,
                      color: theme.muted,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {toDisplayLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableItems.map((item, rowIndex) => {
                if (typeof item !== 'object' || item === null) {
                  return null
                }

                const row = item as Record<string, unknown>
                const isFocused = isFocusedRow(item, focus)

                return (
                  <tr
                    key={rowIndex}
                    style={{
                      background: isFocused ? `${theme.accent}15` : undefined,
                      borderLeft: isFocused ? `3px solid ${theme.accent}` : undefined,
                    }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        style={{
                          padding: '7px 10px',
                          borderBottom: `1px solid ${theme.border}`,
                          color: theme.text,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {toDisplayValue(row[column])}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          {renderExpandControl(theme, expanded, TABLE_PREVIEW_LIMIT, items.length, 'rows', onToggleExpanded)}
        </div>
      )
    }
  }

  if (items && items.length > 0) {
    const cardItems = expanded ? items : items.slice(0, CARD_PREVIEW_LIMIT)

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {focus ? renderFocusLegend(focus, theme) : null}
        {cardItems.map((item, index) => {
          const isFocused = isFocusedRow(item, focus)
          return (
            <div
              key={index}
              style={{
                border: `1px solid ${isFocused ? theme.accent : theme.border}`,
                borderRadius: 10,
                padding: '8px 10px',
                background: isFocused ? `${theme.accent}15` : theme.surfaceAlt,
                display: 'grid',
                gap: 4,
                borderLeft: isFocused ? `3px solid ${theme.accent}` : undefined,
              }}
            >
              {typeof item === 'object' && item !== null
                ? Object.entries(item as Record<string, unknown>).slice(0, 5).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 6 }}>
                      <strong style={{ color: theme.muted, fontSize: 11, textTransform: 'uppercase' }}>{k}</strong>
                      <span style={{ color: theme.text, fontSize: 12 }}>{String(v ?? '')}</span>
                    </div>
                  ))
                : <span style={{ color: theme.text, fontSize: 12 }}>{String(item)}</span>}
            </div>
          )
        })}
        {renderExpandControl(theme, expanded, CARD_PREVIEW_LIMIT, items.length, 'items', onToggleExpanded)}
      </div>
    )
  }

  return <pre style={traceCodeStyle(theme)}>{safeJson(data)}</pre>
}

function renderFallbackBlock(
  block: AiMessageBlock,
  theme: AiPanelTheme,
  activeActionId: string | null,
  proposalState: ReturnType<typeof resolveProposalUiState>,
  onAction: (action: AiActionDescriptor) => Promise<void>,
  expanded: boolean,
  onToggleExpanded: () => void,
): ReactNode {
  if (block.kind === 'entity_collection') {
    const record = block.data as Record<string, unknown> | null | undefined
    const items = Array.isArray(record?.items) ? record.items : null
    if (!items || items.length === 0) {
      return null
    }
  }

  return (
    <section
      key={block.id ?? `${block.kind}-${block.entityType ?? 'generic'}-${block.title ?? 'block'}`}
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 10,
        background: theme.surface,
        display: 'grid',
        gap: 8,
      }}
    >
      {(block.title || block.subtitle || block.entityType) ? (
        <div style={{ display: 'grid', gap: 2 }}>
          {block.title ? <strong style={{ color: theme.text, fontSize: 13 }}>{block.title}</strong> : null}
          {block.subtitle ? <span style={{ color: theme.muted, fontSize: 12 }}>{block.subtitle}</span> : null}
          {block.entityType ? (
            <span style={{ color: theme.accent, fontSize: 11, textTransform: 'uppercase' }}>{block.entityType}</span>
          ) : null}
        </div>
      ) : null}
      {renderBlockData(block, theme, expanded, onToggleExpanded)}
      {block.actions?.length ? (
        <div style={actionRowStyle}>
          {block.actions.map((action) => renderActionButton(action, theme, activeActionId, proposalState, onAction))}
        </div>
      ) : null}
    </section>
  )
}

function AiPanelMessageCardComponent({
  message,
  theme,
  activeActionId,
  mapLegacyDataToBlocks,
  renderBlock: renderCustomBlock,
  onAction,
}: AiPanelMessageCardProps) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const isStatus = message.role === 'status'
  const isAssistant = !isUser && !isError && !isStatus
  const headerLabel = isError ? 'Issue' : isStatus ? 'Status' : null
  const [expandedBlockKeys, setExpandedBlockKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setExpandedBlockKeys(new Set())
  }, [message.id])

  const blocks = useMemo(
    () => (message.blocks?.length
      ? message.blocks
      : (message.data !== undefined && message.data !== null && mapLegacyDataToBlocks
          ? mapLegacyDataToBlocks(message.data) ?? []
          : [])),
    [mapLegacyDataToBlocks, message.blocks, message.data],
  )
  const continuePromptInteractions = useMemo(
    () => message.interactions?.filter((interaction) => interaction.kind === 'continue_prompt') ?? [],
    [message.interactions],
  )
  const renderingHints = message.renderingHints
  const intent = message.intent
  const shouldHideNarrative = intent === 'blocks_only'
  const shouldHideBlocks = intent === 'narrative_only'
  const effectiveHasBlocks = shouldHideBlocks ? false : (renderingHints?.has_blocks ?? blocks.length > 0)

  // Suppress block section + actions when every entity_collection has zero items.
  const allCollectionsEmpty = useMemo(
    () => blocks.length > 0 &&
      blocks.every((block) => {
        if (block.kind !== 'entity_collection') return false
        const record = block.data as Record<string, unknown> | null | undefined
        const items = Array.isArray(record?.items) ? record.items : null
        return !items || items.length === 0
      }),
    [blocks],
  )

  const hasBlocks = effectiveHasBlocks && blocks.length > 0 && !allCollectionsEmpty
  const showRawDataPreview =
    !renderingHints?.suppress_raw_data_preview
    && !shouldHideBlocks
    && message.data !== undefined
    && message.data !== null
    && blocks.length === 0
  const showSectionLabels = isAssistant && hasBlocks
  const proposalState = resolveProposalUiState(message)
  const showProposalNotice = isAssistant && proposalState.kind !== 'none'
  const typedWarnings = message.typedWarnings ?? []
  const showTypedWarnings = isAssistant && typedWarnings.length > 0
  const textSectionTitle = renderingHints?.text_section_title ?? 'Answer'
  const blockSectionTitle = renderingHints?.block_section_title ?? 'Data'

  const effectiveActions = useMemo(() => message.actions ?? [], [message.actions])
  const narrativeContent = useMemo(() => {
    if (shouldHideNarrative) {
      return null
    }

    if (isAssistant) {
      return renderMarkdown(message.content, theme)
    }

    return <div style={messageBodyStyle(theme)}>{message.content}</div>
  }, [isAssistant, message.content, shouldHideNarrative, theme])

  const handleCopy = useCallback(() => {
    void copyToClipboard(message.content)
  }, [message.content])

  const handleToggleBlockExpanded = useCallback((blockKey: string) => {
    setExpandedBlockKeys((current) => {
      const next = new Set(current)
      if (next.has(blockKey)) {
        next.delete(blockKey)
      } else {
        next.add(blockKey)
      }
      return next
    })
  }, [])

  return (
    <article
      style={{
        ...messageCardStyle(theme, message.role),
        alignSelf: isUser ? 'flex-end' : 'stretch',
        marginLeft: isUser ? 'auto' : 0,
      }}
    >
      {headerLabel ? (
        <div style={messageHeaderStyle(theme.header, isUser)}>
          <span>{headerLabel}</span>
        </div>
      ) : null}
      {showSectionLabels && !shouldHideNarrative ? <div style={sectionLabelStyle(theme)}>{textSectionTitle}</div> : null}
      {showProposalNotice ? (
        <div style={proposalNoticeStyle(theme, proposalNoticeTone(proposalState.kind))}>
          <div style={sectionLabelStyle(theme)}>
            {proposalState.kind === 'pending_confirm' ? 'Proposal ready' : 'Proposal status'}
          </div>
          <div style={{ color: theme.text, fontSize: 13, lineHeight: 1.5 }}>{proposalState.message}</div>
        </div>
      ) : null}
      {showTypedWarnings ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {typedWarnings.map((warning, index) => (
            <div
              key={`${warning.code}-${index}`}
              style={proposalNoticeStyle(theme, 'warning')}
            >
              <div style={sectionLabelStyle(theme)}>{warning.code}</div>
              <div style={{ color: theme.text, fontSize: 13, lineHeight: 1.5 }}>{warning.message}</div>
            </div>
          ))}
        </div>
      ) : null}
      {narrativeContent}
      {hasBlocks ? (
        <div style={sectionGroupStyle}>
          {showSectionLabels ? <div style={sectionLabelStyle(theme)}>{blockSectionTitle}</div> : null}
          <div style={{ display: 'grid', gap: 8 }}>
            {blocks.map((block, index) => {
              const blockKey = block.id ?? `${block.kind}-${block.entityType ?? 'generic'}-${index}`
              const isBlockExpanded = expandedBlockKeys.has(blockKey)
              const customBlock = renderCustomBlock?.({
                block,
                message,
                theme,
                activeActionId,
                onAction,
              })

              return (
                <div key={blockKey}>
                  {customBlock ?? renderFallbackBlock(
                    block,
                    theme,
                    activeActionId,
                    proposalState,
                    onAction,
                    isBlockExpanded,
                    () => handleToggleBlockExpanded(blockKey),
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
      {effectiveActions.length ? (
        <div style={actionRowStyle}>
          {effectiveActions.map((action) => renderActionButton(action, theme, activeActionId, proposalState, onAction))}
        </div>
      ) : null}
      {continuePromptInteractions.length ? (
        <div style={actionRowStyle}>
          {continuePromptInteractions.map((interaction) => {
              const interactionId = interaction.id ?? `${interaction.kind}-${interaction.label}`
              return (
                <button
                  key={interactionId}
                  disabled={interaction.disabled}
                  onClick={() => {
                    void onAction({
                      type: 'interaction:continue_prompt',
                      label: interaction.label,
                      payload: {
                        interaction_id: interaction.id,
                        interaction,
                      },
                    })
                  }}
                  style={buttonStyle(theme, 'secondary', interaction.disabled)}
                  title={interaction.hint}
                  type="button"
                >
                  {interaction.label}
                </button>
              )
            })}
        </div>
      ) : null}
      {showRawDataPreview ? (
        <pre style={dataPreviewStyle(theme)}>{safeJson(message.data)}</pre>
      ) : null}
      {!isUser ? (
        <div style={messageFooterStyle}>
          <button
            onClick={handleCopy}
            style={{
              cursor: 'pointer',
            }}
            type="button"
          >
            <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

              <g id="SVGRepo_bgCarrier" strokeWidth={0} />

              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />

              <g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M15 1.25H10.9436C9.10583 1.24998 7.65019 1.24997 6.51098 1.40314C5.33856 1.56076 4.38961 1.89288 3.64124 2.64124C2.89288 3.38961 2.56076 4.33856 2.40314 5.51098C2.24997 6.65019 2.24998 8.10582 2.25 9.94357V16C2.25 17.8722 3.62205 19.424 5.41551 19.7047C5.55348 20.4687 5.81753 21.1208 6.34835 21.6517C6.95027 22.2536 7.70814 22.5125 8.60825 22.6335C9.47522 22.75 10.5775 22.75 11.9451 22.75H15.0549C16.4225 22.75 17.5248 22.75 18.3918 22.6335C19.2919 22.5125 20.0497 22.2536 20.6517 21.6517C21.2536 21.0497 21.5125 20.2919 21.6335 19.3918C21.75 18.5248 21.75 17.4225 21.75 16.0549V10.9451C21.75 9.57754 21.75 8.47522 21.6335 7.60825C21.5125 6.70814 21.2536 5.95027 20.6517 5.34835C20.1208 4.81753 19.4687 4.55348 18.7047 4.41551C18.424 2.62205 16.8722 1.25 15 1.25ZM17.1293 4.27117C16.8265 3.38623 15.9876 2.75 15 2.75H11C9.09318 2.75 7.73851 2.75159 6.71085 2.88976C5.70476 3.02502 5.12511 3.27869 4.7019 3.7019C4.27869 4.12511 4.02502 4.70476 3.88976 5.71085C3.75159 6.73851 3.75 8.09318 3.75 10V16C3.75 16.9876 4.38624 17.8265 5.27117 18.1293C5.24998 17.5194 5.24999 16.8297 5.25 16.0549V10.9451C5.24998 9.57754 5.24996 8.47522 5.36652 7.60825C5.48754 6.70814 5.74643 5.95027 6.34835 5.34835C6.95027 4.74643 7.70814 4.48754 8.60825 4.36652C9.47522 4.24996 10.5775 4.24998 11.9451 4.25H15.0549C15.8297 4.24999 16.5194 4.24998 17.1293 4.27117ZM7.40901 6.40901C7.68577 6.13225 8.07435 5.9518 8.80812 5.85315C9.56347 5.75159 10.5646 5.75 12 5.75H15C16.4354 5.75 17.4365 5.75159 18.1919 5.85315C18.9257 5.9518 19.3142 6.13225 19.591 6.40901C19.8678 6.68577 20.0482 7.07435 20.1469 7.80812C20.2484 8.56347 20.25 9.56458 20.25 11V16C20.25 17.4354 20.2484 18.4365 20.1469 19.1919C20.0482 19.9257 19.8678 20.3142 19.591 20.591C19.3142 20.8678 18.9257 21.0482 18.1919 21.1469C17.4365 21.2484 16.4354 21.25 15 21.25H12C10.5646 21.25 9.56347 21.2484 8.80812 21.1469C8.07435 21.0482 7.68577 20.8678 7.40901 20.591C7.13225 20.3142 6.9518 19.9257 6.85315 19.1919C6.75159 18.4365 6.75 17.4354 6.75 16V11C6.75 9.56458 6.75159 8.56347 6.85315 7.80812C6.9518 7.07435 7.13225 6.68577 7.40901 6.40901Z" fill="currentColor"/> </g>

              </svg>
          </button>
        </div>
      ) : null}
    </article>
  )
}

function areMessageCardPropsEqual(prev: AiPanelMessageCardProps, next: AiPanelMessageCardProps): boolean {
  if (prev.message !== next.message) return false
  if (prev.theme !== next.theme) return false
  if (prev.mapLegacyDataToBlocks !== next.mapLegacyDataToBlocks) return false
  if (prev.renderBlock !== next.renderBlock) return false
  if (prev.onAction !== next.onAction) return false

  if (prev.activeActionId === next.activeActionId) {
    return true
  }

  const prevRelevant = isActionIdRelevant(prev.message, prev.activeActionId)
  const nextRelevant = isActionIdRelevant(next.message, next.activeActionId)
  return !prevRelevant && !nextRelevant
}

export const AiPanelMessageCard = memo(AiPanelMessageCardComponent, areMessageCardPropsEqual)
