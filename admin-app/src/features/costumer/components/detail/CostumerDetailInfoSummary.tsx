import type { Costumer } from '../../dto/costumer.dto'

const infoRowClassName = 'flex items-start justify-between gap-4 border-b border-[var(--color-border)]/60 py-2'

export const CostumerDetailInfoSummary = ({ costumer }: { costumer: Costumer | null }) => {
  if (!costumer) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-muted)]">
        Costumer not found.
      </div>
    )
  }

  const fullName = `${costumer.first_name ?? ''} ${costumer.last_name ?? ''}`.trim() || 'No name'
  const primaryPhone = costumer.default_primary_phone?.phone
  const secondaryPhone = costumer.default_secondary_phone?.phone
  const address = costumer.default_address?.address

  return (
    <div className="h-[300px] overflow-y-auto scroll-thin rounded-xl border border-[var(--color-border)] bg-white p-4">
      <div className={infoRowClassName}>
        <span className="text-xs text-[var(--color-muted)]">Name</span>
        <span className="text-right text-sm font-semibold text-[var(--color-text)]">{fullName}</span>
      </div>
      <div className={infoRowClassName}>
        <span className="text-xs text-[var(--color-muted)]">Email</span>
        <span className="text-right text-sm text-[var(--color-text)]">{costumer.email || '—'}</span>
      </div>
      <div className={infoRowClassName}>
        <span className="text-xs text-[var(--color-muted)]">Primary phone</span>
        <span className="text-right text-sm text-[var(--color-text)]">
          {primaryPhone ? `${primaryPhone.prefix ?? ''} ${primaryPhone.number ?? ''}`.trim() : '—'}
        </span>
      </div>
      <div className={infoRowClassName}>
        <span className="text-xs text-[var(--color-muted)]">Secondary phone</span>
        <span className="text-right text-sm text-[var(--color-text)]">
          {secondaryPhone ? `${secondaryPhone.prefix ?? ''} ${secondaryPhone.number ?? ''}`.trim() : '—'}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4 py-2">
        <span className="text-xs text-[var(--color-muted)]">Address</span>
        <span className="max-w-[70%] text-right text-sm text-[var(--color-text)]">
          {address
            ? [address.street_address, address.city, address.postal_code, address.country]
                .filter(Boolean)
                .join(', ')
            : '—'}
        </span>
      </div>
    </div>
  )
}
