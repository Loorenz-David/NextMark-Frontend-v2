import { useState, useCallback } from 'react'
import type { AIInteraction } from '../types'

export interface ThreadInteractionState {
  /** Currently active blocking interaction (question/confirm) */
  activeInteraction: AIInteraction | null
  /** Whether waiting for a blocking interaction response */
  isAwaitingResponse: boolean
  /** Loading state for responding to interaction */
  isLoading: boolean
}

/**
 * Hook for managing thread interactions (continue_prompt, question, confirm).
 *
 * Phase 1 (current): Handles continue_prompt (non-blocking, optional)
 * Phase 2 (upcoming): Will handle question/confirm (blocking, required)
 */
export function useThreadInteractions() {
  const [interactionState, setInteractionState] = useState<ThreadInteractionState>({
    activeInteraction: null,
    isAwaitingResponse: false,
    isLoading: false,
  })

  /**
   * Handle a continue_prompt interaction click.
   * Non-blocking: immediately suggests the next message to send.
   */
  const handleContinuePrompt = useCallback(
    (interaction: AIInteraction): { suggestedMessage: string } => {
      // Extract suggested text from payload or use label as fallback
      const suggestedMessage =
        (interaction.payload as any)?.suggested_text ||
        (interaction.payload as any)?.suggested_next_action ||
        interaction.label

      return { suggestedMessage }
    },
    []
  )

  /**
   * Display a blocking interaction (question or confirm) and wait for response.
   * Phase 2 only.
   */
  const showBlockingInteraction = useCallback((interaction: AIInteraction) => {
    setInteractionState((prev) => ({
      ...prev,
      activeInteraction: interaction,
      isAwaitingResponse: true,
    }))
  }, [])

  /**
   * Respond to a blocking interaction and clear the state.
   * Phase 2 only.
   */
  const respondToBlockingInteraction = useCallback(
    async (response: string, payload?: Record<string, unknown>) => {
      if (!interactionState.activeInteraction?.id) {
        console.warn('No active interaction to respond to')
        return { interactionId: null, response, payload }
      }

      const interactionId = interactionState.activeInteraction.id
      setInteractionState((prev) => ({ ...prev, isLoading: true }))

      try {
        return {
          interactionId,
          response,
          payload,
        }
      } finally {
        setInteractionState((prev) => ({
          ...prev,
          isLoading: false,
          activeInteraction: null,
          isAwaitingResponse: false,
        }))
      }
    },
    [interactionState.activeInteraction?.id]
  )

  /**
   * Dismiss a non-blocking interaction.
   */
  const dismissInteraction = useCallback((interactionId?: string) => {
    // For phase 1, dismissing just clears the UI
    // Thread continues normally
    // (In phase 2, blocking interactions cannot be dismissed)
  }, [])

  /**
   * Reset all interaction state (e.g., on new message or thread reset).
   */
  const resetInteractions = useCallback(() => {
    setInteractionState({
      activeInteraction: null,
      isAwaitingResponse: false,
      isLoading: false,
    })
  }, [])

  return {
    ...interactionState,
    handleContinuePrompt,
    showBlockingInteraction,
    respondToBlockingInteraction,
    dismissInteraction,
    resetInteractions,
  }
}
