import { useState } from 'react'

import { BackArrowIcon2, FilteredIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { CustomDatePickerCalendarPanel } from '@/shared/inputs/CustomDatePicker/components/CustomDatePickerCalendarPanel'
import type { PlanQueryFilters } from '@/features/plan/types/planMeta'

import { PlanDateFilterOverlay } from './PlanDateFilterOverlay'
import type { PlanDateFilterMode, PlanDateFilterPayload } from './domain/planDateFilter.types'
import { usePlanDateFilterController } from './usePlanDateFilterController'

type PlanDateFilterBarProps = {
  onFiltersChange?: (filters: PlanQueryFilters) => void
  onSelectionChange?: (payload: PlanDateFilterPayload) => void
}

type PickerTarget = 'single' | 'start' | 'end' | null

export const PlanDateFilterBar = ({ onFiltersChange, onSelectionChange }: PlanDateFilterBarProps) => {
  const controller = usePlanDateFilterController({ onFiltersChange, onSelectionChange })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null)
  const [singleVisibleMonth, setSingleVisibleMonth] = useState<Date>(controller.singleDate)
  const [rangeStartVisibleMonth, setRangeStartVisibleMonth] = useState<Date>(controller.rangeStart)
  const [rangeEndVisibleMonth, setRangeEndVisibleMonth] = useState<Date>(controller.rangeEnd)

  const openSinglePicker = () => {
    setSingleVisibleMonth(controller.singleDate)
    setPickerTarget('single')
  }

  const openRangeStartPicker = () => {
    setRangeStartVisibleMonth(controller.rangeStart)
    setPickerTarget('start')
  }

  const openRangeEndPicker = () => {
    setRangeEndVisibleMonth(controller.rangeEnd)
    setPickerTarget('end')
  }

  const hideArrows = controller.mode === 'range'

  return (
    <div className="flex min-w-[260px] flex-1 items-center">
      <div className="flex w-[200px] items-center rounded-full border border-[rgba(112,222,208,0.32)]  px-1.5  shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
        {!hideArrows ? (
          <button
            type="button"
            aria-label="Previous date filter window"
            onClick={controller.goToPrevious}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text)]/85 transition-colors hover:bg-white/[0.08]"
          >
            <BackArrowIcon2 className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center text-center">
          {controller.mode !== 'range' ? (
            <FloatingPopover
              open={pickerTarget === 'single'}
              onOpenChange={(isOpen) => setPickerTarget(isOpen ? 'single' : null)}
              renderInPortal={true}
              floatingClassName="z-[220]"
              reference={
                <button
                  type="button"
                  className="w-full truncate rounded-full px-2 py-1 text-sm font-medium capitalize tracking-[0.02em] text-[var(--color-text)]"
                  onClick={openSinglePicker}
                >
                  {controller.displayLabel}
                </button>
              }
            >
              <CustomDatePickerCalendarPanel
                isOpen={pickerTarget === 'single'}
                value={controller.singleDate}
                visibleMonth={singleVisibleMonth}
                onVisibleMonthChange={setSingleVisibleMonth}
                onSelect={(date) => {
                  if (date instanceof Date) {
                    controller.setSingleDate(date)
                  }
                  setPickerTarget(null)
                }}
                onRequestClose={() => setPickerTarget(null)}
              />
            </FloatingPopover>
          ) : (
            <div className="flex w-full items-center gap-2 px-1">
              <FloatingPopover
                open={pickerTarget === 'start'}
                onOpenChange={(isOpen) => setPickerTarget(isOpen ? 'start' : null)}
                renderInPortal={true}
                floatingClassName="z-[220]"
                reference={
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs font-medium text-[var(--color-text)]/95 hover:bg-white/[0.08]"
                    onClick={openRangeStartPicker}
                  >
                    {controller.displayRangeLabel.start}
                  </button>
                }
              >
                <CustomDatePickerCalendarPanel
                  isOpen={pickerTarget === 'start'}
                  value={controller.rangeStart}
                  visibleMonth={rangeStartVisibleMonth}
                  onVisibleMonthChange={setRangeStartVisibleMonth}
                  onSelect={(date) => {
                    if (date instanceof Date) {
                      controller.setRangeStart(date)
                    }
                    setPickerTarget(null)
                  }}
                  onRequestClose={() => setPickerTarget(null)}
                />
              </FloatingPopover>
              <span className="text-[var(--color-muted)]/75">|</span>
              <FloatingPopover
                open={pickerTarget === 'end'}
                onOpenChange={(isOpen) => setPickerTarget(isOpen ? 'end' : null)}
                renderInPortal={true}
                floatingClassName="z-[220]"
                reference={
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs font-medium text-[var(--color-text)]/95 hover:bg-white/[0.08]"
                    onClick={openRangeEndPicker}
                  >
                    {controller.displayRangeLabel.end}
                  </button>
                }
              >
                <CustomDatePickerCalendarPanel
                  isOpen={pickerTarget === 'end'}
                  value={controller.rangeEnd}
                  visibleMonth={rangeEndVisibleMonth}
                  onVisibleMonthChange={setRangeEndVisibleMonth}
                  onSelect={(date) => {
                    if (date instanceof Date) {
                      controller.setRangeEnd(date)
                    }
                    setPickerTarget(null)
                  }}
                  onRequestClose={() => setPickerTarget(null)}
                />
              </FloatingPopover>
            </div>
          )}
        </div>

        {!hideArrows ? (
          <button
            type="button"
            aria-label="Next date filter window"
            onClick={controller.goToNext}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text)]/85 transition-colors hover:bg-white/[0.08]"
          >
            <BackArrowIcon2 className="h-4 w-4 rotate-180" />
          </button>
        ) : null}

        <FloatingPopover
          open={overlayOpen}
          onOpenChange={setOverlayOpen}
          renderInPortal={true}
          placement="bottom-end"
          offSetNum={10}
          floatingClassName="z-[220]"
          reference={
            <button
              type="button"
              aria-label="Open plan date filters"
              onClick={() => setOverlayOpen((current) => !current)}
              className="ml-auto pr-2 flex h-8 w-8 shrink-0 items-center justify-center  text-[var(--color-muted)] transition-colors cursor-pointer hover:text-[var(--color-muted)]/70"
            >
              <FilteredIcon className="h-5 w-5" />
            </button>
          }
        >
          <PlanDateFilterOverlay
            mode={controller.mode}
            onModeChange={(nextMode: PlanDateFilterMode) => {
              controller.setMode(nextMode)
              setOverlayOpen(false)
            }}
          />
        </FloatingPopover>
      </div>
    </div>
  )
}
