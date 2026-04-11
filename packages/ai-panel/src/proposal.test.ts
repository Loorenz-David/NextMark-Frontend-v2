import { resolveProposalUiState, shouldDisableActionForProposalState } from './proposal'
import type { AiPanelMessage } from './types'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

function createAssistantMessage(overrides: Partial<AiPanelMessage> = {}): AiPanelMessage {
  return {
    id: 'msg_proposal_test',
    role: 'assistant',
    content: 'Proposal response',
    createdAt: Date.now(),
    ...overrides,
  }
}

export const runAiPanelProposalTests = () => {
  {
    const state = resolveProposalUiState(createAssistantMessage())
    assert(state.kind === 'none', 'messages without tool trace should not resolve a proposal state')
    assert(state.disableApply === false, 'messages without proposal state should not disable apply actions')
  }

  {
    const state = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'apply_item_taxonomy_proposal',
            status: 'error',
            errorCode: 'proposal_expired',
            errorMessage: 'This proposal has expired and can no longer be applied.',
          },
        ],
      }),
    )

    assert(state.kind === 'expired', 'proposal_expired should map to expired UI state')
    assert(state.disableApply === true, 'expired proposal should disable apply actions')
    assert(state.suggestedAction === 'regenerate', 'expired proposal should suggest regeneration')
  }

  {
    const state = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'create_item_taxonomy_proposal',
            status: 'success',
            proposalMeta: {
              status: 'pending_confirm',
              version: 3,
            },
          },
        ],
      }),
    )

    assert(state.kind === 'pending_confirm', 'pending_confirm proposal meta should map to pending_confirm state')
    assert(state.disableApply === false, 'pending_confirm should not disable apply actions')
  }

  {
    const state = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'apply_item_taxonomy_proposal',
            status: 'success',
            proposalMeta: {
              status: 'applied',
              applied_at: '2026-03-22T10:00:00Z',
            },
          },
        ],
      }),
    )

    assert(state.kind === 'applied', 'applied proposal meta should map to applied state')
    assert(state.disableApply === true, 'applied proposal should disable repeated apply actions')
    assert(state.suggestedAction === 'refresh', 'applied proposal should suggest refresh')
  }

  {
    const conflictState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'apply_item_taxonomy_proposal',
            status: 'error',
            errorCode: 'proposal_conflict',
            errorMessage: 'approval_token does not match the provided proposal.',
          },
        ],
      }),
    )

    const applyAction = {
      type: 'apply_order_filters',
      label: 'Apply proposal',
    }
    const refreshAction = {
      type: 'navigate',
      label: 'Refresh view',
    }

    const applyGuard = shouldDisableActionForProposalState(applyAction, conflictState)
    const refreshGuard = shouldDisableActionForProposalState(refreshAction, conflictState)

    assert(applyGuard.disabled === true, 'conflict proposal state should disable apply-like actions')
    assert(
      applyGuard.reason === conflictState.message,
      'disabled apply action should expose the proposal state message as the reason',
    )
    assert(refreshGuard.disabled === false, 'conflict proposal state should not disable non-apply actions')
  }

  {
    const validationState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'apply_item_taxonomy_proposal',
            status: 'error',
            errorCode: 'bad_request',
            errorMessage: 'Proposal payload is missing required item types.',
          },
        ],
      }),
    )

    const applyGuard = shouldDisableActionForProposalState(
      { type: 'apply_order_filters', label: 'Apply again' },
      validationState,
    )

    assert(validationState.kind === 'validation_error', 'bad_request should map to validation_error state')
    assert(validationState.disableApply === false, 'validation errors should allow retrying apply actions')
    assert(applyGuard.disabled === false, 'validation errors should not disable apply buttons')
  }

  {
    const validationState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'apply_item_taxonomy_proposal',
            status: 'error',
            errorCode: 'VALIDATION_ERROR',
          },
        ],
      }),
    )

    assert(validationState.kind === 'validation_error', 'VALIDATION_ERROR should map to validation_error state')
  }

  {
    const pastTimeState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'set_delivery_window',
            status: 'error',
            errorCode: 'DELIVERY_WINDOW_PAST_TIME',
          },
        ],
      }),
    )

    assert(
      pastTimeState.kind === 'validation_error',
      'DELIVERY_WINDOW_PAST_TIME should map to validation_error state',
    )
  }

  {
    const overlapState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'set_delivery_window',
            status: 'error',
            errorCode: 'DELIVERY_WINDOW_OVERLAP',
          },
        ],
      }),
    )

    assert(
      overlapState.kind === 'validation_error',
      'DELIVERY_WINDOW_OVERLAP should map to validation_error state',
    )
  }

  {
    const limitState = resolveProposalUiState(
      createAssistantMessage({
        toolTrace: [
          {
            tool: 'set_delivery_window',
            status: 'error',
            errorCode: 'DELIVERY_WINDOW_LIMIT_EXCEEDED',
          },
        ],
      }),
    )

    assert(
      limitState.kind === 'validation_error',
      'DELIVERY_WINDOW_LIMIT_EXCEEDED should map to validation_error state',
    )
  }
}