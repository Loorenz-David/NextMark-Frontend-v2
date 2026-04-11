import { AnimatePresence, motion } from 'framer-motion'
import { BoldArrowIcon } from '@/assets/icons'
import type { AssignedStopOrderItemViewModel } from '@/app/contracts/routeExecution.types'

type OrderItemCardProps = {
  item: AssignedStopOrderItemViewModel
  isExpanded: boolean
  onToggle: () => void
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/55">{label}</span>
      <span className="max-w-[60%] text-right text-white">{value}</span>
    </div>
  )
}

export function OrderItemCard({
  item,
  isExpanded,
  onToggle,
}: OrderItemCardProps) {
  const propertyRows = item.properties.length > 0
    ? item.properties
    : [{ label: 'Properties', value: '—' }]

  return (
    <article className="shrink-0 overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {item.itemType ?? 'Unknown item type'}
          </p>
          <p className="mt-1 truncate text-xs text-white/55">
            {item.articleNumber ?? 'No article number'}
          </p>
        </div>

        <BoldArrowIcon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-white/72 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded-content"
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-4 py-4">
              <div className="flex flex-col gap-3 text-xs">
                <DetailRow label="Item type" value={item.itemType ?? '—'} />
                <DetailRow label="Article number" value={item.articleNumber ?? '—'} />
                <DetailRow label="Reference number" value={item.referenceNumber ?? '—'} />
                <DetailRow label="Quantity" value={item.quantity != null ? String(item.quantity) : '—'} />
                <DetailRow label="Weight (gr)" value={item.weight != null ? String(item.weight) : '—'} />
                <DetailRow label="Dimensions (cm)" value={item.dimensionsLabel ?? '—'} />
                <DetailRow label="Page link" value={item.pageLink ?? '—'} />
                {propertyRows.map((property) => (
                  <DetailRow
                    key={`${item.clientId}:${property.label}`}
                    label={property.label}
                    value={property.value}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  )
}
