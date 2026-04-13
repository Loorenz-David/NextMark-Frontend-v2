import { useEffect, useMemo, useState } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { CustomCounter } from '@/shared/inputs/CustomCounter'
import { CollapsibleSection } from '@/shared/inputs/CollapsibleSection'
import SegmentedSelect from '@/shared/inputs/SegmentedSelect'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import {
  formatMessageScheduleSummary,
  getMessageScheduleAnchorCopy,
  getMessageScheduleValueBounds,
  MESSAGE_SCHEDULE_UNITS,
  sanitizeMessageScheduleDraft,
  supportsFutureAnchorScheduling,
  type MessageScheduleDraft,
  type MessageScheduleMode,
  type MessageScheduleUnit,
} from '../domain'

type MessageScheduleControlLabels = {
  buttonLabel: string
  popupTitle: string
  popupDescription: string
}

type MessageScheduleControlProps = {
  eventKey: string
  value: MessageScheduleDraft
  onApply: (value: MessageScheduleDraft) => void
  labels?: Partial<MessageScheduleControlLabels>
}

const DEFAULT_LABELS: MessageScheduleControlLabels = {
  buttonLabel: 'Schedule',
  popupTitle: 'Message schedule',
  popupDescription: 'Choose when this message should be sent for the selected event.',
}

const SCHEDULE_STATE_OPTIONS = [
  { label: 'Immediately', value: 'immediate' },
  { label: 'Scheduled', value: 'scheduled' },
] as const

const FUTURE_ANCHOR_MODE_OPTIONS = [
  { label: 'After window', value: 'after_anchor' },
  { label: 'At start', value: 'at_anchor' },
  { label: 'Before window', value: 'before_anchor' },
] as const

const STANDARD_MODE: MessageScheduleMode = 'after_anchor'

export const MessageScheduleControl = ({
  eventKey,
  value,
  onApply,
  labels,
}: MessageScheduleControlProps) => {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels }
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => sanitizeMessageScheduleDraft(value, eventKey))

  const supportsFutureAnchor = supportsFutureAnchorScheduling(eventKey)
  const safeValue = useMemo(() => sanitizeMessageScheduleDraft(value, eventKey), [eventKey, value])
  const safeDraft = useMemo(() => sanitizeMessageScheduleDraft(draft, eventKey), [draft, eventKey])
  const isImmediate = safeDraft.mode === 'immediate'
  const isAtAnchor = safeDraft.mode === 'at_anchor'
  const activeScheduledMode = supportsFutureAnchor ? safeDraft.mode : STANDARD_MODE
  const selectedUnitLabel = safeDraft.unit.charAt(0).toUpperCase() + safeDraft.unit.slice(1)
  const valueBounds = getMessageScheduleValueBounds(safeDraft.unit, safeDraft.mode, eventKey)

  useEffect(() => {
    if (!open) {
      setDraft(safeValue)
    }
  }, [open, safeValue])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraft(safeValue)
    }
    setOpen(nextOpen)
  }

  const handleScheduleStateChange = (nextValue: string | number) => {
    if (nextValue === 'immediate') {
      setDraft({
        ...safeDraft,
        mode: 'immediate',
      })
      return
    }

    setDraft({
      ...safeDraft,
      mode: supportsFutureAnchor ? 'after_anchor' : STANDARD_MODE,
      value: safeDraft.value < 1 ? 1 : safeDraft.value,
    })
  }

  const handleScheduledModeChange = (nextValue: string | number) => {
    setDraft(
      sanitizeMessageScheduleDraft(
        {
          ...safeDraft,
          mode: nextValue as MessageScheduleMode,
          value: nextValue === 'at_anchor' ? 0 : Math.max(safeDraft.value, 1),
        },
        eventKey,
      ),
    )
  }

  const handleUnitChange = (nextUnit: MessageScheduleUnit) => {
    setDraft(
      sanitizeMessageScheduleDraft(
        {
          ...safeDraft,
          unit: nextUnit,
        },
        eventKey,
      ),
    )
  }

  const handleValueChange = (nextValue: number) => {
    setDraft(
      sanitizeMessageScheduleDraft(
        {
          ...safeDraft,
          value: nextValue,
        },
        eventKey,
      ),
    )
  }

  const handleCancel = () => {
    setDraft(safeValue)
    setOpen(false)
  }

  const handleApply = () => {
    onApply(sanitizeMessageScheduleDraft(safeDraft, eventKey))
    setOpen(false)
  }

  const summary = formatMessageScheduleSummary(safeValue, eventKey)

  return (
    <FloatingPopover
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottom-end"
      offSetNum={10}
      renderInPortal
      reference={
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: () => setOpen((current) => !current),
            className: 'min-w-[170px] px-4 py-2 text-left',
            ariaLabel: `${resolvedLabels.buttonLabel}: ${summary}`,
          }}
        >
          <span className="flex flex-col items-start gap-0.5">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {resolvedLabels.buttonLabel}
            </span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{summary}</span>
          </span>
        </BasicButton>
      }
    >
      <div className="admin-glass-popover w-[min(420px,92vw)] rounded-[24px] border border-[var(--color-border-accent)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)]/70 px-4 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {resolvedLabels.popupTitle}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {resolvedLabels.popupDescription}
            </p>
          </div>
          <BasicButton
            params={{
              variant: 'ghost',
              onClick: handleCancel,
              className: 'px-2 py-1 text-xs text-[var(--color-muted)]',
              ariaLabel: 'Close schedule popup',
            }}
          >
            Close
          </BasicButton>
        </div>

        <div className="flex max-h-[min(78vh,720px)] flex-col gap-5 overflow-y-auto px-4 py-4">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            {getMessageScheduleAnchorCopy(eventKey)}
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Send timing
            </span>
            <SegmentedSelect
              options={SCHEDULE_STATE_OPTIONS.map((option) => ({ ...option }))}
              selectedValue={isImmediate ? 'immediate' : 'scheduled'}
              onSelect={handleScheduleStateChange}
              styleConfig={{
                containerBg: 'rgba(15,23,42,0.06)',
                containerBorder: 'rgba(148,163,184,0.24)',
                selectedBg: 'var(--color-page)',
                selectedBorder: 'rgba(148,163,184,0.24)',
                textColor: 'var(--color-muted)',
                selectedTextColor: 'var(--color-text)',
              }}
            />
          </div>

          {!isImmediate && supportsFutureAnchor ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Anchor relation
              </span>
              <SegmentedSelect
                options={FUTURE_ANCHOR_MODE_OPTIONS.map((option) => ({ ...option }))}
                selectedValue={activeScheduledMode}
                onSelect={handleScheduledModeChange}
                styleConfig={{
                  containerBg: 'rgba(15,23,42,0.06)',
                  containerBorder: 'rgba(148,163,184,0.24)',
                  selectedBg: 'var(--color-page)',
                  selectedBorder: 'rgba(148,163,184,0.24)',
                  textColor: 'var(--color-muted)',
                  selectedTextColor: 'var(--color-text)',
                  textSize: '14px',
                }}
              />
            </div>
          ) : null}

          {!isImmediate && !isAtAnchor ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Delay amount
                </span>
                <CustomCounter
                  value={safeDraft.value}
                  onChange={handleValueChange}
                  min={valueBounds.min}
                  max={valueBounds.max}
                  className="custom-field-container h-12 items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Time unit
                </span>
                <CollapsibleSection
                  closeOnInsideClick
                  title={
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-semibold text-[var(--color-text)]">{selectedUnitLabel}</span>
                      <span className="text-xs text-[var(--color-muted)]">Choose minutes, hours, or days</span>
                    </div>
                  }
                  sectionClassName="rounded-xl border border-[var(--color-border)] bg-[var(--color-page)]"
                  buttonClassName="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex flex-col gap-1">
                    {MESSAGE_SCHEDULE_UNITS.map((unit) => {
                      const isSelected = unit === safeDraft.unit
                      return (
                        <button
                          key={unit}
                          type="button"
                          data-popover-close
                          onClick={() => handleUnitChange(unit)}
                          className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                            isSelected
                              ? 'bg-[var(--color-accent)]/10 font-semibold text-[var(--color-text)]'
                              : 'text-[var(--color-muted)] hover:bg-black/5'
                          }`}
                        >
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </button>
                      )
                    })}
                  </div>
                </CollapsibleSection>
              </div>
            </>
          ) : null}

          {!isImmediate && isAtAnchor ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-black/[0.02] px-4 py-3 text-sm text-[var(--color-muted)]">
              This message will be sent exactly when the delivery window starts.
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)]/70 px-4 py-4">
          <BasicButton
            params={{
              variant: 'ghost',
              onClick: handleCancel,
              className: 'px-3 py-1 text-xs text-[var(--color-muted)]',
              ariaLabel: 'Cancel schedule changes',
            }}
          >
            Cancel
          </BasicButton>
          <BasicButton
            params={{
              variant: 'secondary',
              onClick: handleApply,
              className: 'px-4 py-2 text-sm',
              ariaLabel: 'Apply schedule changes',
            }}
          >
            Apply
          </BasicButton>
        </div>
      </div>
    </FloatingPopover>
  )
}
