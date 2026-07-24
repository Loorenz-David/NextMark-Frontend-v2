
import { StateCard } from '@/shared/layout/StateCard'
import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import type { OrderCase } from '../types'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

type PropsOrderCaseCard = {
orderCase: OrderCase
onOpenCase: (caseId:string) => void
onDeleteCase?:(caseId:string) => void
}
export const OrderCaseCard = ({
    orderCase,
    onOpenCase,
    onDeleteCase
}: PropsOrderCaseCard) => {
    const relativeCreationDate = formatIsoDateRelative(orderCase.creation_date)
    const stateColor =
      orderCase.state === 'Open'
        ? '#60a5fa'
        : orderCase.state === 'Resolving'
          ? '#f7c948'
          : '#68d6c3'

    return ( 
        <div
          key={orderCase.client_id}
          className="admin-glass-panel rounded-3xl border-border px-4 py-4 cursor-pointer"
          style={{ boxShadow: 'none' }}
          onClick={() => onOpenCase(orderCase.client_id)}
        >
          <div
            role="button"
            className="flex w-full items-start justify-between gap-4 text-left"
            
          >
            <div className="min-w-0 flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[0.98rem] font-semibold tracking-tight text-[var(--color-text)]">
                  {orderCase.label?.trim() ? orderCase.label : `Case #${orderCase.id}`}
                </span>
                <div className="self-stretch w-px bg-surface-hover"></div>
                <span className="text-[0.8rem] text-[var(--color-muted)]">Order # {orderCase.order_reference}</span>
              </div>

              <span className="text-[0.72rem] text-[var(--color-muted)]">
                {relativeCreationDate ?? orderCase.creation_date}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <StateCard label={orderCase.state} color={stateColor} style={{ maxWidth: '120px', borderRadius: '999px', paddingInline: '12px', paddingBlock: '6px' }} />
              {orderCase.unseen_chats > 0 ? (
                <span className="rounded-full border border-[rgba(104,214,195,0.18)] bg-[rgba(104,214,195,0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[rgb(184,255,242)] uppercase">
                  {orderCase.unseen_chats} unseen
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            {onDeleteCase ? (
                <ConfirmActionButton
                      onConfirm={ () => onDeleteCase(orderCase.client_id)}
                      deleteContent={<span>Delete</span>}
                      confirmContent={<span>Confirm delete</span>}
                      deleteClassName="rounded-full border border-danger-border bg-danger-bg px-3 py-1.5 text-[11px] font-medium text-danger transition hover:bg-danger-bg"
                      confirmClassName="rounded-full px-3 py-1.5 text-[11px] font-medium text-danger-on-solid bg-danger-solid/85"
                      confirmOverLay="bg-danger-solid-medium/70"
                />
                
              ) : null}
          </div>
        </div>
    );
}
