import { useState } from 'react'
import type { FormEvent } from 'react'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { CapabilityGate } from '@/shared/components'

export function QuickOrderPage() {
  const { workspace } = useWorkspace()
  const { independentDriverApi } = useDriverServices()
  const [status, setStatus] = useState<string>()
  const [formState, setFormState] = useState({
    referenceNumber: '',
    customerName: '',
    customerPhone: '',
    streetAddress: '',
    city: '',
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!workspace?.capabilities.canCreateOrders) {
      return
    }
    try {
      await independentDriverApi.createQuickOrder(formState)
      setStatus('Quick order command submitted.')
      setFormState({
        referenceNumber: '',
        customerName: '',
        customerPhone: '',
        streetAddress: '',
        city: '',
      })
    } catch (error) {
      console.error('Failed to create quick order', error)
      setStatus('Unable to create quick order.')
    }
  }

  return (
    <section className="driver-page">
      <div className="page-header">
        <div>
          <div className="driver-kicker">Independent mode only</div>
          <h2>Quick order creation</h2>
        </div>
      </div>

      <form className="driver-form route-card" onSubmit={handleSubmit}>
        <label>
          Reference number
          <input
            value={formState.referenceNumber}
            onChange={(event) => setFormState((prev) => ({ ...prev, referenceNumber: event.target.value }))}
            required
          />
        </label>
        <label>
          Customer name
          <input
            value={formState.customerName}
            onChange={(event) => setFormState((prev) => ({ ...prev, customerName: event.target.value }))}
            required
          />
        </label>
        <label>
          Customer phone
          <input
            value={formState.customerPhone}
            onChange={(event) => setFormState((prev) => ({ ...prev, customerPhone: event.target.value }))}
          />
        </label>
        <label>
          Street address
          <input
            value={formState.streetAddress}
            onChange={(event) => setFormState((prev) => ({ ...prev, streetAddress: event.target.value }))}
            required
          />
        </label>
        <label>
          City
          <input
            value={formState.city}
            onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))}
          />
        </label>
        <CapabilityGate capability="canCreateOrders">
          <button className="primary-button" type="submit">
            Create quick order
          </button>
        </CapabilityGate>
        {status ? <p className="driver-subtitle">{status}</p> : null}
      </form>
    </section>
  )
}
