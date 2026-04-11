export type DeliveryWindowCalendarShellViewMode = 'auto' | 'desktop' | 'mobile'

export type DeliveryWindowCalendarShellSizePreset =
  | 'desktopPopup550'
  | 'desktopRegular'
  | 'mobile'

type DeliveryWindowCalendarLayoutScale = {
  desktopColumns: string
  desktopGapClassName: string
  desktopLeftGapClassName: string
  desktopRightGapClassName: string
  mobileGapClassName: string
}

type DeliveryWindowCalendarScale = {
  rootClassName: string
  headerClassName: string
  headerRowClassName: string
  navButtonClassName: string
  navIconClassName: string
  monthTitleClassName: string
  weekdayRowClassName: string
  weekdayLabelClassName: string
  dayCellClassName: string
  dayNumberClassName: string
  dayWindowCountClassName: string
  dayWindowSelectedCountClassName: string
  dayClosedClassName: string
  dayClosedLabel: string
  footerClassName: string
}

type DeliveryWindowCalendarModeScale = {
  rootClassName: string
  buttonClassName: string
  activeButtonClassName: string
  inactiveButtonClassName: string
}

type DeliveryWindowCalendarListScale = {
  rootClassName: string
  headerClassName: string
  titleClassName: string
  subtitleClassName: string
  clearActionClassName: string
  groupsClassName: string
  groupClassName: string
  groupDateClassName: string
  windowsStackClassName: string
  windowCardClassName: string
  windowMetaRowClassName: string
  windowItemClassName: string
  windowTimeClassName: string
  windowActionsClassName: string
  editActionClassName: string
  removeActionClassName: string
  emptyClassName: string
}

type DeliveryWindowCalendarEditorScale = {
  rootClassName: string
  headerRowClassName: string
  titleClassName: string
  datesClassName: string
  controlsRowClassName: string
  pickerClassName: string
  betweenLabelClassName: string
  actionsClassName: string
  cancelButtonClassName: string
  applyButtonClassName: string
}

export type DeliveryWindowCalendarShellScale = {
  layout: DeliveryWindowCalendarLayoutScale
  calendar: DeliveryWindowCalendarScale
  mode: DeliveryWindowCalendarModeScale
  list: DeliveryWindowCalendarListScale
  editor: DeliveryWindowCalendarEditorScale
}

export type DeliveryWindowCalendarShellScaleOverrides = Partial<{
  layout: Partial<DeliveryWindowCalendarLayoutScale>
  calendar: Partial<DeliveryWindowCalendarScale>
  mode: Partial<DeliveryWindowCalendarModeScale>
  list: Partial<DeliveryWindowCalendarListScale>
  editor: Partial<DeliveryWindowCalendarEditorScale>
}>

const DELIVERY_WINDOW_CALENDAR_SHELL_PRESETS: Record<
  DeliveryWindowCalendarShellSizePreset,
  DeliveryWindowCalendarShellScale
> = {
  desktopPopup550: {
    layout: {
      desktopColumns: 'minmax(0,65%) minmax(0,35%)',
      desktopGapClassName: 'gap-2',
      desktopLeftGapClassName: 'gap-2',
      desktopRightGapClassName: 'gap-2',
      mobileGapClassName: 'gap-2',
    },
    calendar: {
      rootClassName:
        'overflow-hidden rounded-lg border border-[var(--color-border-accent)] bg-[var(--color-page)] p-1',
      headerClassName: 'border-b mb-1 border-[var(--color-border-accent)]',
      headerRowClassName: 'flex items-center justify-between px-2 py-2',
      navButtonClassName:
        'flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border-accent)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-border-accent)]/40 hover:text-[var(--color-text)]',
      navIconClassName: 'h-3 w-3',
      monthTitleClassName: 'text-sm font-semibold text-[var(--color-text)]',
      weekdayRowClassName: 'grid grid-cols-7 px-2 pb-1',
      weekdayLabelClassName:
        'text-center text-[10px] font-semibold text-[var(--color-muted)]',
      dayCellClassName: ' h-10 w-8   text-xs ',
      dayNumberClassName: 'text-[11px] font-semibold',
      dayWindowCountClassName:
        'rounded-full bg-[var(--color-dark-blue)]/10  px-1.5 py-0.5 text-[9px] font-semibold text-[var(--color-dark-blue)]',
      dayWindowSelectedCountClassName: 'text-white bg-[var(--color-page)]/20',
      dayClosedClassName:
        'rounded-full bg-red-400 h-2 w-2',
      dayClosedLabel:'',
      footerClassName: 'px-2 pb-2',
    },
    mode: {
      rootClassName: 'flex flex-wrap gap-1.5',
      buttonClassName: 'rounded-full border px-2 py-0.5 text-[11px] transition-colors',
      activeButtonClassName:
        'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-page)]',
      inactiveButtonClassName:
        'border-[var(--color-border-accent)] bg-[var(--color-page)] text-[var(--color-muted)]',
    },
    list: {
      rootClassName:
        'rounded-lg border border-[var(--color-border-accent)] bg-[var(--color-page)] py-3 h-[370px] overflow-hidden',
      headerClassName: 'mb-3 px-3 flex items-center justify-between gap-2',
      titleClassName: 'text-xs font-semibold text-[var(--color-text)]',
      subtitleClassName: 'mt-1 text-[11px] text-[var(--color-muted)]',
      clearActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-[9px] font-normal normal-case tracking-normal text-[var(--color-muted)] underline hover:bg-transparent',
      groupsClassName: 'flex flex-col gap-3 h-full px-3 overflow-y-auto scroll-thin pb-10',
      groupClassName: 'flex flex-col gap-1.5',
      groupDateClassName: 'text-[10px] font-semibold text-[var(--color-text)]',
      windowsStackClassName: 'flex flex-col gap-1.5',
      windowCardClassName: 'flex flex-col gap-1.5',
      windowMetaRowClassName: 'flex items-center justify-between gap-2',
      windowItemClassName:
        'flex items-center gap-2 rounded-xl bg-[var(--color-light-blue)]/12 px-2.5 py-1.5',
      windowTimeClassName:
        'flex min-w-0 items-center gap-2 text-[10px] font-medium text-[var(--color-dark-blue)]',
      windowActionsClassName: 'flex items-center gap-1',
      editActionClassName:
        ' rounded-sm px-1 py-[2px] text-[9px] text-[var(--color-muted)] hover:bg-blue-100 cursor-pointer',
      removeActionClassName:
        ' rounded-sm px-1 py-[2px] text-[9px]  text-red-500 hover:bg-red-100 cursor-pointer',
      emptyClassName: 'text-[11px] text-[var(--color-muted)] px-2',
    },
    editor: {
      rootClassName:
        'rounded-lg border border-[var(--color-border-accent)] bg-[var(--color-page)] p-3',
      headerRowClassName: 'flex min-w-0 flex-1 flex-col gap-2 ',
      titleClassName:
        'text-xs font-semibold text-[var(--color-text)]',
      datesClassName:
        'pb-1 text-[10px] text-[var(--color-muted)] whitespace-nowrap',
      controlsRowClassName:
        'flex items-start justify-between gap-3',
      pickerClassName:
        'w-[85px] rounded-full border border-[var(--color-border-accent)] bg-[linear-gradient(180deg,rgba(33,45,46,0.96),rgba(24,34,35,0.94))] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
      betweenLabelClassName: 'text-xs text-[var(--color-muted)]',
      actionsClassName: 'flex  flex-col items-stretch gap-2 pr-2 ',
      cancelButtonClassName:
        'px-4 py-1 text-[12px] rounded-sm border-1 border-[var(--color-border-accent)]  text-base text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-border)]',
      applyButtonClassName:
        'rounded-full border border-[rgba(131,204,185,0.26)] bg-[rgba(131,204,185,0.12)] px-4 py-1.5 text-[12px] font-semibold  text-[var(--color-primary)] shadow-[0_10px_24px_rgba(22,49,46,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-[rgba(131,204,185,0.18)]',
    },
  },
  desktopRegular: {
    layout: {
      desktopColumns: 'minmax(0,60%) minmax(0,40%)',
      desktopGapClassName: 'gap-3',
      desktopLeftGapClassName: 'gap-3',
      desktopRightGapClassName: 'gap-3',
      mobileGapClassName: 'gap-3',
    },
    calendar: {
      rootClassName:
        'overflow-hidden rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)]',
      headerClassName: 'border-b border-[var(--color-border-accent)]',
      headerRowClassName: 'flex items-center justify-between px-3 py-3',
      navButtonClassName:
        'flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-accent)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-border-accent)]/40 hover:text-[var(--color-text)]',
      navIconClassName: 'h-4 w-4',
      monthTitleClassName: 'text-xl font-semibold text-[var(--color-text)]',
      weekdayRowClassName: 'grid grid-cols-7 px-3 pb-2',
      weekdayLabelClassName:
        'text-center text-sm font-semibold text-[var(--color-muted)]',
      dayCellClassName: 'mx-1 my-1 h-24 p-2 text-base',
      dayNumberClassName: 'text-xl font-semibold',
      dayWindowCountClassName:
        'rounded-full bg-[var(--color-dark-blue)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-dark-blue)]',
      dayWindowSelectedCountClassName: '',
      dayClosedClassName:
        'self-end text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]',
      dayClosedLabel:'Closed',
      footerClassName: 'px-3 pb-3',
    },
    mode: {
      rootClassName: 'flex flex-wrap gap-2',
      buttonClassName: 'rounded-full border px-3 py-1 text-sm transition-colors',
      activeButtonClassName:
        'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-page)]',
      inactiveButtonClassName:
        'border-[var(--color-border-accent)] bg-transparent text-[var(--color-muted)]',
    },
    list: {
      rootClassName:
        'rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4',
      headerClassName: 'mb-4 flex items-start justify-between gap-3',
      titleClassName: 'text-xl font-semibold text-[var(--color-text)]',
      subtitleClassName: 'mt-1 text-base text-[var(--color-muted)]',
      clearActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-sm font-normal normal-case tracking-normal text-[var(--color-muted)] underline hover:bg-transparent',
      groupsClassName: 'flex flex-col gap-4',
      groupClassName: 'flex flex-col gap-2',
      groupDateClassName: 'text-2xl font-semibold text-[var(--color-text)]',
      windowsStackClassName: 'flex flex-col gap-2',
      windowCardClassName: 'flex flex-col gap-2',
      windowMetaRowClassName: 'flex items-center justify-between gap-3',
      windowItemClassName:
        'flex items-center gap-3 rounded-2xl bg-[var(--color-light-blue)]/12 px-4 py-3',
      windowTimeClassName:
        'flex min-w-0 items-center gap-2ext-lg font-medium text-[var(--color-dark-blue)]',
      windowActionsClassName: 'flex items-center gap-2',
      editActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-sm text-[var(--color-muted)] hover:text-[var(--color-dark-blue)]',
      removeActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-sm font-normal normal-case tracking-normal text-red-500 hover:bg-red-200',
      emptyClassName: 'text-sm text-[var(--color-muted)]',
    },
    editor: {
      rootClassName:
        'rounded-[34px] border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4',
      headerRowClassName: 'flex min-w-0 flex-1 flex-col gap-3',
      titleClassName:
        'text-2xl font-semibold text-[var(--color-text)]',
      datesClassName:
        'pb-2 text-xs text-[var(--color-muted)] whitespace-nowrap',
      controlsRowClassName:
        'flex items-start justify-between gap-4',
      pickerClassName:
        'min-w-[140px] max-w-[170px] rounded-full border border-[var(--color-border-accent)] bg-[linear-gradient(180deg,rgba(33,45,46,0.96),rgba(24,34,35,0.94))] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
      betweenLabelClassName: 'text-2xl text-[var(--color-muted)]',
      actionsClassName: 'flex min-w-[150px] flex-col items-stretch gap-3',
      cancelButtonClassName:
        'border-[var(--color-border-accent)] px-4 py-2 text-xl text-[var(--color-text)]',
      applyButtonClassName:
        'rounded-full border border-[rgba(131,204,185,0.26)] bg-[rgba(131,204,185,0.12)] px-5 py-2 text-base font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] shadow-[0_12px_28px_rgba(22,49,46,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-[rgba(131,204,185,0.18)]',
    },
  },
  mobile: {
    layout: {
      desktopColumns: 'minmax(0,1fr)',
      desktopGapClassName: 'gap-3',
      desktopLeftGapClassName: 'gap-3',
      desktopRightGapClassName: 'gap-3',
      mobileGapClassName: 'gap-3',
    },
    calendar: {
      rootClassName:
        'overflow-hidden rounded-xl border border-[var(--color-border-accent)] bg-[var(--color-page)]',
      headerClassName: 'border-b border-[var(--color-border-accent)]',
      headerRowClassName: 'flex items-center justify-between px-3 py-2',
      navButtonClassName:
        'flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-accent)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-border-accent)]/40 hover:text-[var(--color-text)]',
      navIconClassName: 'h-3.5 w-3.5',
      monthTitleClassName: 'text-base font-semibold text-[var(--color-text)]',
      weekdayRowClassName: 'grid grid-cols-7 px-2 pb-1',
      weekdayLabelClassName:
        'text-center text-xs font-semibold text-[var(--color-muted)]',
      dayCellClassName: 'mx-0.5 my-0.5 h-16 p-1.5 text-sm',
      dayNumberClassName: 'text-sm font-semibold',
      dayWindowCountClassName:
        'rounded-full bg-[var(--color-dark-blue)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-dark-blue)]',
      dayWindowSelectedCountClassName: '',
      dayClosedClassName:
        'rounded-full bg-red-400 h-2 w-2',
      dayClosedLabel:'',
      footerClassName: 'px-2 pb-2',
    },
    mode: {
      rootClassName: 'flex flex-wrap gap-2',
      buttonClassName: 'rounded-full border px-3 py-1 text-xs transition-colors',
      activeButtonClassName:
        'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-page)]',
      inactiveButtonClassName:
        'border-[var(--color-border-accent)] bg-transparent text-[var(--color-muted)]',
    },
    list: {
      rootClassName:
        'rounded-xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-3',
      headerClassName: 'mb-3 flex items-start justify-between gap-2',
      titleClassName: 'text-base font-semibold text-[var(--color-text)]',
      subtitleClassName: 'mt-1 text-sm text-[var(--color-muted)]',
      clearActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-xs font-normal normal-case tracking-normal text-[var(--color-muted)] underline hover:bg-transparent',
      groupsClassName: 'flex flex-col gap-3',
      groupClassName: 'flex flex-col gap-1.5',
      groupDateClassName: 'text-sm font-semibold text-[var(--color-text)]',
      windowsStackClassName: 'flex flex-col gap-1.5',
      windowCardClassName: 'flex flex-col gap-1.5',
      windowMetaRowClassName: 'flex items-center justify-between gap-2',
      windowItemClassName:
        'flex items-center gap-2 rounded-xl bg-[var(--color-light-blue)]/12 px-3 py-2',
      windowTimeClassName:
        'flex min-w-0 items-center gap-2ext-sm font-medium text-[var(--color-dark-blue)]',
      windowActionsClassName: 'flex items-center gap-1.5',
      editActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-dark-blue)]',
      removeActionClassName:
        'h-auto border-0 bg-transparent px-0 py-0 text-[11px] font-normal normal-case tracking-normal text-red-500 hover:bg-red-200',
      emptyClassName: 'text-xs text-[var(--color-muted)]',
    },
    editor: {
      rootClassName:
        'rounded-[24px] border border-[var(--color-border-accent)] bg-[var(--color-page)] p-3',
      headerRowClassName: 'flex min-w-0 flex-1 flex-col gap-2',
      titleClassName:
        'text-lg font-semibold text-[var(--color-text)]',
      datesClassName:
        'pb-1 text-[11px] text-[var(--color-muted)] whitespace-nowrap',
      controlsRowClassName:
        'flex items-start justify-between gap-3',
      pickerClassName:
        'min-w-[104px] max-w-[130px] rounded-full border border-[var(--color-border-accent)] bg-[linear-gradient(180deg,rgba(33,45,46,0.96),rgba(24,34,35,0.94))] px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
      betweenLabelClassName: 'text-lg text-[var(--color-muted)]',
      actionsClassName: 'flex min-w-[116px] flex-col items-stretch gap-2',
      cancelButtonClassName:
        'border-[var(--color-border-accent)] px-3 py-1.5 text-base text-[var(--color-text)]',
      applyButtonClassName:
        'rounded-full border border-[rgba(131,204,185,0.26)] bg-[rgba(131,204,185,0.12)] px-3.5 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)] shadow-[0_10px_22px_rgba(22,49,46,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-[rgba(131,204,185,0.18)]',
    },
  },
}

export const resolveDeliveryWindowCalendarShellScale = ({
  preset,
  overrides,
}: {
  preset: DeliveryWindowCalendarShellSizePreset
  overrides?: DeliveryWindowCalendarShellScaleOverrides
}): DeliveryWindowCalendarShellScale => {
  const base = DELIVERY_WINDOW_CALENDAR_SHELL_PRESETS[preset]

  return {
    layout: { ...base.layout, ...overrides?.layout },
    calendar: { ...base.calendar, ...overrides?.calendar },
    mode: { ...base.mode, ...overrides?.mode },
    list: { ...base.list, ...overrides?.list },
    editor: { ...base.editor, ...overrides?.editor },
  }
}

export const DEFAULT_DELIVERY_WINDOW_CALENDAR_SHELL_PRESET: DeliveryWindowCalendarShellSizePreset =
  'desktopPopup550'
