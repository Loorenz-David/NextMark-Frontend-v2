import type { ReactNode } from "react";


export const CELL_DEFAULT = 'cell-default'


export const Cell = ({ 
    cellClass = CELL_DEFAULT, 
    children 
}: { cellClass?: string; children: ReactNode }
) => (
  <div className={cellClass}>{children}</div>
)


export const ROW_DEFAULT = 'row-default'

export const SplitRow = ({
  splitRowClass = ROW_DEFAULT,
  children,
}: {
  splitRowClass?: string
  children: ReactNode
}) => <div className={`border-t border-[var(--color-border-accent)] ${splitRowClass}`}>{children}</div>
