import type { ReactNode } from 'react'
import { InfoHover } from '@/shared/layout/InfoHover'
import type { InfoHoverMessage } from '@/shared/layout/InfoHover'

export const RouteGroupEditFormSectionGroup = ({
  label,
  children,
  info,
}: {
  label: string
  children: ReactNode
  info?: InfoHoverMessage | InfoHoverMessage[]
}) => (
  <div className="flex flex-col gap-1 rounded-lg shadow-md p-4 border-1 border-[var(--color-border)] bg-[var(--color-page)]">
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-[var(--color-muted)]">
        {label}
      </span>
      {info ? <InfoHover content={info} /> : null}
    </div>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
)
