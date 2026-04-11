import type { BusinessEventEnvelope, BusinessEventName } from '../contracts'

type InvalidationAdapterOptions = {
  eventNames: BusinessEventName[]
  onInvalidate: (event: BusinessEventEnvelope) => void
}

export const createInvalidationAdapter = ({ eventNames, onInvalidate }: InvalidationAdapterOptions) => {
  const accepted = new Set(eventNames)

  return (event: BusinessEventEnvelope) => {
    if (!accepted.has(event.event_name)) {
      return
    }

    onInvalidate(event)
  }
}
