import { useState } from 'react'
import type { FormEvent } from 'react'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { CapabilityGate } from '@/shared/components'

export function QuickRoutePage() {
  const { workspace } = useWorkspace()
  const { independentDriverApi } = useDriverServices()
  const [status, setStatus] = useState<string>()
  const [formState, setFormState] = useState({
    label: '',
    startAddress: '',
    endAddress: '',
    selectedOrderClientIds: '',
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!workspace?.capabilities.canCreateRoutes) {
      return
    }

    try {
      await independentDriverApi.createQuickRoute({
        label: formState.label,
        startAddress: formState.startAddress,
        endAddress: formState.endAddress,
        selectedOrderClientIds: formState.selectedOrderClientIds
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
      })
      setStatus('Quick route command submitted.')
    } catch (error) {
      console.error('Failed to create quick route', error)
      setStatus('Unable to create quick route.')
    }
  }

  return (
    <section className="driver-page">
      <div className="page-header">
        <div>
          <div className="driver-kicker">Independent mode only</div>
          <h2>Quick route builder</h2>
        </div>
      </div>

      <form className="driver-form route-card" onSubmit={handleSubmit}>
        <label>
          Route label
          <input
            value={formState.label}
            onChange={(event) => setFormState((prev) => ({ ...prev, label: event.target.value }))}
            required
          />
        </label>
        <label>
          Start address
          <input
            value={formState.startAddress}
            onChange={(event) => setFormState((prev) => ({ ...prev, startAddress: event.target.value }))}
            required
          />
        </label>
        <label>
          End address
          <input
            value={formState.endAddress}
            onChange={(event) => setFormState((prev) => ({ ...prev, endAddress: event.target.value }))}
          />
        </label>
        <label>
          Order client ids
          <textarea
            value={formState.selectedOrderClientIds}
            onChange={(event) => setFormState((prev) => ({ ...prev, selectedOrderClientIds: event.target.value }))}
            placeholder="comma,separated,client_ids"
          />
        </label>
        <CapabilityGate capability="canCreateRoutes">
          <button className="primary-button" type="submit">
            Create quick route
          </button>
        </CapabilityGate>
        {status ? <p className="driver-subtitle">{status}</p> : null}
      </form>
    </section>
  )
}
