import type { ReactNode } from 'react'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { Switch } from '@/shared/inputs/Switch'

import type { ClientFormRule } from '../types/clientFormRule'

type ClientFormRuleCardProps = {
  rule: ClientFormRule
  onEdit: (clientId: string) => void
  onToggleEnabled: (rule: ClientFormRule, enabled: boolean) => void
  onDelete: (rule: ClientFormRule) => void
  dragHandle?: ReactNode
}

export const ClientFormRuleCard = ({
  rule,
  onEdit,
  onToggleEnabled,
  onDelete,
  dragHandle,
}: ClientFormRuleCardProps) => (
  <div
    className={`flex w-full items-start gap-4 rounded-3xl border border-border bg-surface-raised px-5 py-4 ${
      rule.enabled ? '' : 'opacity-60'
    }`}
  >
    {dragHandle}

    {rule.image_url ? (
      <img
        src={rule.image_url}
        alt=""
        className="h-12 w-12 shrink-0 rounded-2xl border border-border object-cover"
      />
    ) : null}

    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{rule.title}</p>
        {rule.icon ? (
          <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {rule.icon}
          </span>
        ) : null}
      </div>
      {rule.body ? (
        <p className="line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">{rule.body}</p>
      ) : (
        <p className="text-xs italic text-[var(--color-muted)]/70">No description</p>
      )}
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <Switch
        value={rule.enabled}
        onChange={(value) => onToggleEnabled(rule, value)}
        ariaLabel={`Show "${rule.title}" on the form`}
        sizeClassName="h-7 w-12"
      />
      <button
        type="button"
        onClick={() => onEdit(rule.client_id)}
        className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        Edit
      </button>
      <ConfirmActionButton
        onConfirm={() => onDelete(rule)}
        deleteContent="Delete"
        confirmContent="Confirm"
        deleteClassName="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-danger hover:text-danger"
        confirmClassName="rounded-full px-3 py-1 text-xs text-text"
      />
    </div>
  </div>
)
