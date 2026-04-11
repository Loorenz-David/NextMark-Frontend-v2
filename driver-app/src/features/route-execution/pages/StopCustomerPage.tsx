import { CloseIcon } from '@/assets/icons'
import { useStopCustomerController } from '../controllers/useStopCustomer.controller'

type StopCustomerPageProps = {
  stopClientId: string
  onClose: () => void
}

function CustomerDetailCard({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value ?? 'Not set'}</p>
    </div>
  )
}

export function StopCustomerPage({
  stopClientId,
  onClose,
}: StopCustomerPageProps) {
  const controller = useStopCustomerController(stopClientId)

  return (
    <section className="flex h-full min-h-[40vh] max-h-full flex-1 flex-col overflow-hidden bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Customer</h2>
          <p className="mt-1 text-sm text-white/60">Order contact and delivery details.</p>
        </div>

        <button
          aria-label="Close customer details"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-5 py-5 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg aria-hidden="true" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                <path d="M4 21C4.9 17.9 7.9 16 12 16C16.1 16 19.1 17.9 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Customer profile</p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-white">{controller.previewName}</h3>

              {controller.customer?.costumerId != null ? (
                <p className="mt-2 text-sm text-white/55">Customer ID #{controller.customer.costumerId}</p>
              ) : null}

            
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3">
          <CustomerDetailCard label="Full name" value={controller.customer?.fullName ?? null} />
          <CustomerDetailCard label="Primary phone" value={controller.customer?.primaryPhone ?? null} />
          <CustomerDetailCard label="Secondary phone" value={controller.customer?.secondaryPhone ?? null} />
          <CustomerDetailCard label="Email" value={controller.customer?.email ?? null} />
          <CustomerDetailCard label="Delivery address" value={controller.customer?.addressLine ?? null} />
        </div>
      </div>
    </section>
  )
}
