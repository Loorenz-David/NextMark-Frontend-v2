import type { AiActionDescriptor, AiPanelMessage, AiProposalErrorCode } from './types'

export type ProposalUiStateKind =
  | 'none'
  | 'pending_confirm'
  | 'applied'
  | 'expired'
  | 'cancelled'
  | 'conflict'
  | 'invalid_state'
  | 'validation_error'
  | 'execution_failed'

export interface ProposalUiState {
  kind: ProposalUiStateKind
  message: string
  disableApply: boolean
  suggestedAction?: 'regenerate' | 'refresh' | 'retry' | 'reconfirm'
}

function mapErrorCodeToUiState(errorCode: AiProposalErrorCode, fallbackMessage?: string): ProposalUiState {
  switch (errorCode) {
    case 'proposal_expired':
      return {
        kind: 'expired',
        message: 'This proposal expired. Regenerate a new proposal before applying changes.',
        disableApply: true,
        suggestedAction: 'regenerate',
      }
    case 'proposal_cancelled':
      return {
        kind: 'cancelled',
        message: 'This proposal was cancelled. Generate a new proposal to continue.',
        disableApply: true,
        suggestedAction: 'regenerate',
      }
    case 'proposal_already_applied':
      return {
        kind: 'applied',
        message: 'This proposal was already applied. Refresh to sync the latest configuration.',
        disableApply: true,
        suggestedAction: 'refresh',
      }
    case 'proposal_conflict':
      return {
        kind: 'conflict',
        message: 'Proposal conflict detected. Refresh and reconfirm with a new proposal version.',
        disableApply: true,
        suggestedAction: 'reconfirm',
      }
    case 'proposal_invalid_state':
      return {
        kind: 'invalid_state',
        message: 'Proposal state is invalid for apply. Regenerate and try again.',
        disableApply: true,
        suggestedAction: 'regenerate',
      }
    case 'bad_request':
    case 'VALIDATION_ERROR':
      return {
        kind: 'validation_error',
        message: fallbackMessage ?? 'Validation failed. Fix the request and try again.',
        disableApply: false,
        suggestedAction: 'retry',
      }
    case 'DELIVERY_WINDOW_PAST_TIME':
      return {
        kind: 'validation_error',
        message: fallbackMessage ?? 'The selected delivery window starts in the past. Pick a future time window.',
        disableApply: false,
        suggestedAction: 'retry',
      }
    case 'DELIVERY_WINDOW_OVERLAP':
      return {
        kind: 'validation_error',
        message: fallbackMessage ?? 'The delivery window overlaps an existing one. Adjust the time range and try again.',
        disableApply: false,
        suggestedAction: 'retry',
      }
    case 'DELIVERY_WINDOW_LIMIT_EXCEEDED':
      return {
        kind: 'validation_error',
        message: fallbackMessage ?? 'The maximum number of delivery windows was reached. Remove one before adding another.',
        disableApply: false,
        suggestedAction: 'retry',
      }
    case 'tool_execution_failed':
    default:
      return {
        kind: 'execution_failed',
        message: fallbackMessage ?? 'Tool execution failed. Retry or regenerate the proposal.',
        disableApply: false,
        suggestedAction: 'retry',
      }
  }
}

export function resolveProposalUiState(message: AiPanelMessage): ProposalUiState {
  const entries = message.toolTrace ?? []
  if (!entries.length) {
    return { kind: 'none', message: '', disableApply: false }
  }

  const latestErrorEntry = [...entries].reverse().find((entry) => entry.status === 'error' && entry.errorCode)
  if (latestErrorEntry?.errorCode) {
    return mapErrorCodeToUiState(latestErrorEntry.errorCode, latestErrorEntry.errorMessage)
  }

  const latestMeta = [...entries].reverse().find((entry) => entry.proposalMeta)?.proposalMeta
  if (latestMeta?.status === 'applied') {
    return {
      kind: 'applied',
      message: 'Proposal applied successfully.',
      disableApply: true,
      suggestedAction: 'refresh',
    }
  }

  if (latestMeta?.status === 'pending_confirm') {
    return {
      kind: 'pending_confirm',
      message: 'Proposal is waiting for your confirmation.',
      disableApply: false,
    }
  }

  return { kind: 'none', message: '', disableApply: false }
}

export function shouldDisableActionForProposalState(
  action: AiActionDescriptor,
  proposalState: ProposalUiState,
): { disabled: boolean; reason?: string } {
  if (!proposalState.disableApply) {
    return { disabled: false }
  }

  const token = `${action.type} ${action.label}`.toLowerCase()
  const isApplyLikeAction = token.includes('apply')
  if (!isApplyLikeAction) {
    return { disabled: false }
  }

  return {
    disabled: true,
    reason: proposalState.message,
  }
}
