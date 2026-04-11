import type { PhoneCallOption } from '@/app/services/phoneCall.service'
import { useDriverServices } from '@/app/providers/driverServices.context'

type UsePhoneCallChooserControllerDependencies = {
  options: PhoneCallOption[]
  onClose: () => void
}

export function usePhoneCallChooserController({
  options,
  onClose,
}: UsePhoneCallChooserControllerDependencies) {
  const { phoneCallService } = useDriverServices()

  function selectPhone(option: PhoneCallOption) {
    phoneCallService.launchPhoneCall(option.dialValue)
    onClose()
  }

  return {
    options,
    selectPhone,
  }
}
