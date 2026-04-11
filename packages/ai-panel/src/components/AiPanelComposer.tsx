import type { AiCapabilityMode, AiCapabilityOption, AiPanelTheme } from '../types'
import { useMemo } from 'react'
import {
  composerActionsRowStyle,
  composerFooterStyle,
  composerFrameStyle,
  composerHintStyle,
  composerInputStyle,
  composerShellStyle,
  composerSubmitButtonStyle,
  composerTopRowStyle,
} from '../styles'

interface AiPanelComposerProps {
  value: string
  placeholder: string
  capabilityMode?: AiCapabilityMode
  selectedCapabilityId?: string
  capabilityOptions?: AiCapabilityOption[]
  disabled: boolean
  theme: AiPanelTheme
  onCapabilitySelectionChange?: (value: string) => void
  onChange: (value: string) => void
  onSubmit: () => Promise<void>
}

const CAPABILITY_LABEL_OVERRIDES: Record<string, string> = {
  statistical_reasoning: 'Statistical Reasoning',
  operations: 'Operations',
  app_configuration: 'App Configuration',
}

const CAPABILITY_DESCRIPTION_OVERRIDES: Record<string, string> = {
  statistical_reasoning: 'Responds as a statistician focused on quantitative analysis. Tool actions are typically disabled.',
  operations: 'Focused on logistics operations such as create, reschedule, and replan workflows.',
  app_configuration: 'Focused on app setup and configuration workflows, such as creating item types for forms.',
}

function formatCapabilityLabel(option: AiCapabilityOption): string {
  if (CAPABILITY_LABEL_OVERRIDES[option.id]) {
    return CAPABILITY_LABEL_OVERRIDES[option.id]
  }

  if (!option.label || option.label === option.id) {
    return option.id
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return option.label
}

export function AiPanelComposer({
  value,
  placeholder,
  capabilityMode = 'auto',
  selectedCapabilityId = '',
  capabilityOptions = [],
  disabled,
  theme,
  onCapabilitySelectionChange = () => undefined,
  onChange,
  onSubmit,
}: AiPanelComposerProps) {
  const composerTheme = theme.composer
  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  };

  const selectedCapabilityKey = capabilityMode === 'auto' ? '__auto__' : selectedCapabilityId
  const selectedCapabilityDescription = useMemo(() => {
    if (selectedCapabilityKey === '__auto__') {
      return 'Automatically infers the best capability from the user intent for this message.'
    }

    return CAPABILITY_DESCRIPTION_OVERRIDES[selectedCapabilityKey]
      ?? `Uses the ${selectedCapabilityKey.replace(/[_-]+/g, ' ')} capability profile.`
  }, [selectedCapabilityKey])



  return (
    <div style={composerShellStyle(composerTheme)}>
      <div style={composerFrameStyle(composerTheme)}>
        <div style={composerTopRowStyle()}>
          <textarea

            disabled={disabled}
            onInput={(event) => resize(event.currentTarget)}
            onChange={(event) => {
              onChange(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void onSubmit()
              }
            }}
            placeholder={placeholder}
            rows={1}
            style={composerInputStyle(composerTheme)}
            value={value}

          />
        </div>
        <div style={composerActionsRowStyle(composerTheme)}>
          <div style={composerFooterStyle}>
            <div style={composerHintStyle(composerTheme)}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <select
                  disabled={disabled}
                  onChange={(event) => onCapabilitySelectionChange(event.target.value)}
                  style={{
                    color: composerTheme.text,
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  title={selectedCapabilityDescription}
                  value={capabilityMode === 'auto' ? '__auto__' : selectedCapabilityId}
                >
                  <option value="__auto__">Auto </option>
                  {capabilityOptions.map((option) => (
                    <option key={option.id} value={option.id}>{formatCapabilityLabel(option)}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              disabled={disabled || !value.trim()}
              onClick={() => void onSubmit()}
              style={composerSubmitButtonStyle(composerTheme, disabled || !value.trim())}
              type="button"
            >
              <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', transform: 'rotate(90deg)' }}
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"/>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>
                <g id="SVGRepo_iconCarrier"><path d="M6 12H18M6 12L11 7M6 12L11 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


