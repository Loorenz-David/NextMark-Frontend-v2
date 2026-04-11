import type { DriverServices } from '@/app/providers/driverServices.context'
import type { AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import { buildStopPhoneCallOptions } from '../domain/buildStopPhoneCallOptions'

type HandleCallPhoneFlowDependencies = {
  stop: AssignedStopViewModel | null
  services: Pick<DriverServices, 'phoneCallService'>
  openPhoneCallChooser: (options: ReturnType<typeof buildStopPhoneCallOptions>) => void
}

type HandleCallPhoneFlowResult =
  | { status: 'called' | 'chooser-opened' }
  | { status: 'missing-phone' }

export function handleCallPhoneFlow({
  stop,
  services,
  openPhoneCallChooser,
}: HandleCallPhoneFlowDependencies): HandleCallPhoneFlowResult {
  const options = buildStopPhoneCallOptions(stop)

  if (options.length === 0) {
    return { status: 'missing-phone' }
  }

  if (options.length === 1) {
    services.phoneCallService.launchPhoneCall(options[0].dialValue)
    return { status: 'called' }
  }

  openPhoneCallChooser(options)
  return { status: 'chooser-opened' }
}
