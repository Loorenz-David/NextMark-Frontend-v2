import { useEffect, useMemo, useState } from 'react'

import { buttonStyle, composerSubmitButtonStyle } from '../styles'
import type {
  AiActionDescriptor,
  AIInteraction,
  AiInteractionField,
  AiPanelTheme,
} from '../types'

interface AiPanelBlockingInteractionProps {
  interaction: AIInteraction
  isLoading: boolean
  theme: AiPanelTheme
  runAction: (action: AiActionDescriptor) => Promise<void>
}

export function AiPanelBlockingInteraction({
  interaction,
  isLoading,
  theme,
  runAction,
}: AiPanelBlockingInteractionProps) {
  const [draft, setDraft] = useState('')
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [currentPage, setCurrentPage] = useState(0)

  const isQuestion = interaction.kind === 'question'
  const isConfirm = interaction.kind === 'confirm'
  const isFormQuestion = isQuestion && interaction.response_mode === 'form'
  const fields = interaction.fields ?? []
  const currentField = isFormQuestion ? fields[currentPage] : null
  const selectedSingleQuestionOption = !isFormQuestion
    ? interaction.options?.find((option) => option.id === draft) ?? null
    : null

  useEffect(() => {
    setDraft('')
    setCurrentPage(0)

    if (!interaction.fields?.length) {
      setFormValues({})
      return
    }

    const nextValues = Object.fromEntries(
      interaction.fields.map((field) => [field.id, field.default_value ?? getEmptyValue(field)]),
    )
    setFormValues(nextValues)
  }, [interaction.fields, interaction.id])

  const currentFieldValidationMessage = currentField
    ? getFieldValidationMessage(currentField, formValues[currentField.id])
    : null

  const canSubmitQuestion = useMemo(() => {
    if (isFormQuestion) {
      return Boolean(fields.length) && !isLoading && areFormFieldsValid(fields, formValues)
    }

    return draft.trim().length > 0 && !isLoading
  }, [draft, fields, formValues, isFormQuestion, isLoading])

  const canMoveToNextPage = useMemo(() => {
    if (!currentField) {
      return false
    }

    return !currentFieldValidationMessage && !isLoading
  }, [currentField, currentFieldValidationMessage, isLoading])

  const isLastPage = !currentField || currentPage === fields.length - 1
  const fieldStepStates = fields.map((field) => {
    const value = formValues[field.id]
    const hasValue = !isEmptyValue(value)
    const isValid = !getFieldValidationMessage(field, value)

    return {
      field,
      hasValue,
      isValid,
      isComplete: hasValue && isValid,
    }
  })
  const completedStepCount = fieldStepStates.filter((step) => step.isComplete).length
  const completionRatio = fields.length > 0 ? completedStepCount / fields.length : 0

  const updateFormValue = (fieldId: string, value: unknown) => {
    setFormValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
  }

  const submitQuestion = async () => {
    if (!interaction.id) {
      return
    }

    if (isFormQuestion) {
      if (!interaction.fields?.length) {
        return
      }

      if (!areFormFieldsValid(interaction.fields ?? [], formValues)) {
        return
      }

      await runAction({
        type: 'interaction:answer_question',
        label: 'Submit clarification form',
        payload: {
          interaction_id: interaction.id,
          response_message: 'Clarification form submitted',
          interaction_form: normalizeInteractionForm(fields, formValues),
        },
      })
      return
    }

    const message = draft.trim()
    if (!message) {
      return
    }

    await runAction({
      type: 'interaction:answer_question',
      label: 'Submit answer',
      payload: {
        interaction_id: interaction.id,
        response_message: message,
      },
    })
    setDraft('')
  }

  const submitConfirm = async (accepted: boolean) => {
    if (!interaction.id) {
      return
    }

    await runAction({
      type: 'interaction:confirm',
      label: accepted ? 'Confirm' : 'Cancel',
      payload: {
        interaction_id: interaction.id,
        response_message: accepted ? 'yes' : 'cancel',
        confirm_accepted: accepted,
      },
    })
  }

  const submitCancelQuestion = async () => {
    if (!interaction.id) {
      return
    }

    await runAction({
      type: 'interaction:cancel',
      label: 'Cancel operation',
      payload: {
        interaction_id: interaction.id,
        response_message: 'cancel',
      },
    })
  }

  const goToNextPage = () => {
    if (!isFormQuestion || !currentField || !canMoveToNextPage || isLastPage) {
      return
    }

    setCurrentPage((page) => page + 1)
  }

  const goToPreviousPage = () => {
    if (!isFormQuestion || currentPage === 0) {
      return
    }

    setCurrentPage((page) => page - 1)
  }

  const jumpToPage = (pageIndex: number) => {
    if (!isFormQuestion || pageIndex >= currentPage || pageIndex < 0 || pageIndex >= fields.length) {
      return
    }

    setCurrentPage(pageIndex)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        borderTop: `1px solid ${theme.border}`,
        background: theme.background,
        padding: '12px 16px 16px',
        display: 'grid',
        gap: 12,
      }}
    >
      {interaction.required ? (
        <div
          style={{
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: theme.surfaceAlt,
            padding: '10px 12px',
            display: 'grid',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <strong style={{ color: theme.text, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Action required to continue
            </strong>
            {isFormQuestion ? (
              <button
                disabled={isLoading}
                onClick={() => void submitCancelQuestion()}
                style={buttonStyle(theme, 'ghost', isLoading)}
                type="button"
              >
                Cancel operation
              </button>
            ) : null}
          </div>
          <span style={{ color: theme.muted, fontSize: 12, lineHeight: 1.45 }}>
            This thread is waiting for your response and cannot be dismissed until you answer.
          </span>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 4 }}>
        <strong style={{ color: theme.text, fontSize: 13 }}>{interaction.label}</strong>
        {interaction.hint ? (
          <span style={{ color: theme.muted, fontSize: 12 }}>{interaction.hint}</span>
        ) : null}
        {!isFormQuestion && isQuestion && interaction.options?.length ? (
          <span style={{ color: theme.muted, fontSize: 12 }}>
            Choose an option or type your own answer below.
          </span>
        ) : null}
        {isFormQuestion ? (
          <span style={{ color: theme.muted, fontSize: 12 }}>
            Answer one field at a time. You can move back and forth before submitting everything together.
          </span>
        ) : null}
      </div>

      {isQuestion ? (
        <>
          {!isFormQuestion && interaction.options?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {interaction.options.map((option) => (
                <button
                  key={option.id}
                  disabled={isLoading}
                  onClick={() => setDraft(option.id)}
                  style={getSelectableButtonStyle({
                    theme,
                    disabled: isLoading,
                    selected: draft === option.id,
                  })}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {!isFormQuestion && selectedSingleQuestionOption ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 999,
                border: `1px solid ${theme.border}`,
                background: theme.surfaceAlt,
                color: theme.text,
                fontSize: 12,
                width: 'fit-content',
              }}
            >
              <span style={{ color: theme.muted }}>Selected</span>
              <strong>{selectedSingleQuestionOption.label}</strong>
            </div>
          ) : null}

          {isFormQuestion ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {currentField ? (
                <>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 999,
                        background: theme.surfaceAlt,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(completionRatio * 100, 8)}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: theme.accent,
                          transition: 'width 180ms ease',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: theme.muted, fontSize: 12 }}>
                      Question {currentPage + 1} of {fields.length}
                    </span>
                    <span style={{ color: theme.muted, fontSize: 12 }}>
                      {currentField.required ? 'Required' : 'Optional'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 6 }}>
                    <label style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>
                      {currentField.label}
                      {currentField.required ? ' *' : ''}
                    </label>
                    {renderFieldInput({
                      field: currentField,
                      isLoading,
                      theme,
                      value: formValues[currentField.id],
                      onChange: (value) => updateFormValue(currentField.id, value),
                    })}
                    {currentField.suggestions?.length ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {currentField.suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            disabled={isLoading}
                            onClick={() => updateFormValue(currentField.id, getSuggestionValue(currentField, suggestion.id, suggestion.label))}
                            style={getSelectableButtonStyle({
                              theme,
                              disabled: isLoading,
                              selected: areValuesEquivalent(
                                formValues[currentField.id],
                                getSuggestionValue(currentField, suggestion.id, suggestion.label),
                              ),
                            })}
                            type="button"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {currentField.help_text ? (
                      <span style={{ color: theme.muted, fontSize: 12 }}>{currentField.help_text}</span>
                    ) : null}
                    {fieldStepStates[currentPage]?.isComplete ? (
                      <span style={{ color: theme.text, fontSize: 12, opacity: 0.8 }}>
                        Answer saved for this step.
                      </span>
                    ) : null}
                    {currentFieldValidationMessage ? (
                      <span style={{ color: '#ffb4b4', fontSize: 12 }}>{currentFieldValidationMessage}</span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <input
              disabled={isLoading}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  if (canSubmitQuestion) {
                    void submitQuestion()
                  }
                }
              }}
              placeholder="Develop your own answer..."
              style={{
                width: '100%',
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surfaceAlt,
                color: theme.text,
                padding: '10px 12px',
                font: 'inherit',
              }}
              type="text"
              value={draft}
            />
          )}

          {isFormQuestion ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex',  gap: 8 }}>
                <button
                  disabled={isLoading || currentPage === 0}
                  onClick={goToPreviousPage}
                  style={buttonStyle(theme, 'ghost', isLoading || currentPage === 0)}
                  type="button"
                >
                  Back
                </button>
                {!isLastPage ? (
                  <button
                    disabled={!canMoveToNextPage}
                    onClick={goToNextPage}
                    style={buttonStyle(theme, 'secondary', !canMoveToNextPage)}
                    type="button"
                  >
                    Next
                  </button>
                ) : null}
              </div>
                <button
                  disabled={!canSubmitQuestion || !isLastPage}
                  onClick={() => void submitQuestion()}
                  style={getComposerLikeSubmitStyle(theme, !canSubmitQuestion || !isLastPage)}
                  type="button"
                >
                  {isLoading ? 'Sending...' : 'Submit details'}
                </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                disabled={isLoading}
                onClick={() => void submitCancelQuestion()}
                style={buttonStyle(theme, 'ghost', isLoading)}
                type="button"
              >
                Cancel operation
              </button>
              <button
                disabled={!canSubmitQuestion}
                onClick={() => void submitQuestion()}
                style={getComposerLikeSubmitStyle(theme, !canSubmitQuestion)}
                type="button"
              >
                {isLoading ? 'Sending...' : 'Submit answer'}
              </button>
            </div>
          )}
        </>
      ) : null}

      {isConfirm ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            disabled={isLoading}
            onClick={() => void submitConfirm(false)}
            style={buttonStyle(theme, 'secondary', isLoading)}
            type="button"
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={() => void submitConfirm(true)}
            style={buttonStyle(theme, 'primary', isLoading)}
            type="button"
          >
            {isLoading ? 'Sending...' : 'Yes, proceed'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function getSelectableButtonStyle({
  theme,
  disabled,
  selected,
}: {
  theme: AiPanelTheme
  disabled: boolean
  selected: boolean
}) {
  return {
    ...buttonStyle(theme, selected ? 'primary' : 'secondary', disabled),
    boxShadow: selected ? `0 0 0 1px ${theme.accent} inset` : undefined,
    transform: selected ? 'translateY(-1px)' : 'none',
  }
}

function getComposerLikeSubmitStyle(theme: AiPanelTheme, disabled: boolean) {
  return {
    ...composerSubmitButtonStyle(theme.composer, disabled),
    border: '1px solid transparent',
    borderRadius: 999,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
  }
}

function areValuesEquivalent(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true
  }

  if (left == null || right == null) {
    return false
  }

  return String(left) === String(right)
}

function getEmptyValue(field: AiInteractionField): string | number | boolean | null {
  if (field.type === 'boolean') {
    return false
  }

  return null
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function getFieldValidationMessage(field: AiInteractionField, value: unknown): string | null {
  if (field.required && isEmptyValue(value)) {
    return 'This field is required.'
  }

  if (isEmptyValue(value)) {
    return null
  }

  if (typeof value === 'string') {
    if (field.validation?.max_length && value.length > field.validation.max_length) {
      return `Maximum length is ${field.validation.max_length}.`
    }

    if (field.validation?.pattern === 'phone' || field.type === 'phone') {
      if (!/^[+\d()\s-]{6,}$/.test(value.trim())) {
        return 'Enter a valid phone number.'
      }
    }

    if (field.validation?.pattern === 'email' || field.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Enter a valid email address.'
      }
    }
  }

  if (typeof value === 'number') {
    if (typeof field.validation?.min === 'number' && value < field.validation.min) {
      return `Minimum value is ${field.validation.min}.`
    }

    if (typeof field.validation?.max === 'number' && value > field.validation.max) {
      return `Maximum value is ${field.validation.max}.`
    }
  }

  return null
}

function areFormFieldsValid(fields: AiInteractionField[], values: Record<string, unknown>): boolean {
  return fields.every((field) => !getFieldValidationMessage(field, values[field.id]))
}

function normalizeInteractionForm(fields: AiInteractionField[], values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values[field.id]

      if (isEmptyValue(value)) {
        return [field.id, field.required ? value ?? '' : null]
      }

      return [field.id, value]
    }),
  )
}

function getSuggestionValue(field: AiInteractionField, suggestionId: string, suggestionLabel: string): unknown {
  if (!field.required && /^(no_|none$|null$|empty$|unknown$)/i.test(suggestionId)) {
    return null
  }

  if (field.type === 'boolean') {
    return suggestionId === 'true' || suggestionId === 'yes'
  }

  return suggestionId || suggestionLabel
}

function renderFieldInput({
  field,
  isLoading,
  theme,
  value,
  onChange,
}: {
  field: AiInteractionField
  isLoading: boolean
  theme: AiPanelTheme
  value: unknown
  onChange: (value: unknown) => void
}) {
  const inputStyle = {
    width: '100%',
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceAlt,
    color: theme.text,
    padding: '10px 12px',
    font: 'inherit',
  } as const

  if (field.type === 'textarea') {
    return (
      <textarea
        disabled={isLoading}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={4}
        style={{ ...inputStyle, resize: 'vertical' }}
        value={typeof value === 'string' ? value : ''}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        disabled={isLoading}
        onChange={(event) => onChange(event.target.value || null)}
        style={inputStyle}
        value={typeof value === 'string' ? value : ''}
      >
        <option value="">Select an option</option>
        {(field.options ?? []).map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.text, fontSize: 13 }}>
        <input
          checked={Boolean(value)}
          disabled={isLoading}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        {field.placeholder ?? 'Enabled'}
      </label>
    )
  }

  return (
    <input
      disabled={isLoading}
      max={field.validation?.max}
      min={field.validation?.min}
      onChange={(event) => {
        if (field.type === 'number') {
          onChange(event.target.value === '' ? null : Number(event.target.value))
          return
        }

        onChange(event.target.value)
      }}
      placeholder={field.placeholder}
      style={inputStyle}
      type={mapFieldTypeToInputType(field.type)}
      value={typeof value === 'number' ? String(value) : typeof value === 'string' ? value : ''}
    />
  )
}

function mapFieldTypeToInputType(fieldType: AiInteractionField['type']): string {
  switch (fieldType) {
    case 'phone':
      return 'tel'
    case 'email':
      return 'email'
    case 'number':
      return 'number'
    case 'date':
      return 'date'
    case 'datetime':
      return 'datetime-local'
    default:
      return 'text'
  }
}
