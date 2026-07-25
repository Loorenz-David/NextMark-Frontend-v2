import type { ReactNode } from 'react'
import { InfoHover } from '@/shared/layout/InfoHover'
import { ORDER_FORM_COSTUMER_INFO } from '../../info/costumer.info'

type CostumerPanelShellProps = {
  children: ReactNode
  hidePanelTitle?: boolean
  headerAction?: ReactNode
  titleAdornment?: ReactNode
  headerBoxClassName?: string
}

export const CostumerPanelShell = ({
  children,
  hidePanelTitle,
  headerAction,
  titleAdornment,
  headerBoxClassName,
}: CostumerPanelShellProps) => {
  const resolvedHeaderBoxClassName =
    headerBoxClassName ?? 'px-4 pt-3 mb-4 pb-3  shadow-sm'

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border)]/60 bg-[var(--surface-popup-chrome)]">
      {!hidePanelTitle ? (
        <div className={`flex w-full items-center justify-between gap-2 ${resolvedHeaderBoxClassName}`}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[12px] font-semibold">Costumer</span>
            <InfoHover content={ORDER_FORM_COSTUMER_INFO} />
            {titleAdornment ?? null}
          </div>
          {headerAction ?? null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
