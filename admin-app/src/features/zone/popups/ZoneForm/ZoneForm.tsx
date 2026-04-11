import {
  FeaturePopupBody,
  FeaturePopupHeader,
  FeaturePopupShell,
} from '@/shared/popups/featurePopup'
import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ZoneFormFeature } from '../../forms/zoneForm/ZoneForm'

import { ZoneFormProvider } from './ZoneForm.provider'
import type { ZoneFormPayload } from './ZoneForm.types'

export const ZoneForm = ({
  payload,
  onClose,
}: StackComponentProps<ZoneFormPayload>) => {
  const resolvedPayload = payload ?? null
  if (!resolvedPayload) {
    return null
  }

  const title = resolvedPayload.mode === 'create' ? 'Create Zone' : 'Edit Zone'
  const subtitle =
    resolvedPayload.mode === 'create'
      ? 'Create a new zone from the drawn geometry.'
      : 'Update zone name and template defaults.'

  return (
    <ZoneFormProvider payload={resolvedPayload} onClose={() => onClose?.()}>
      <FeaturePopupShell
        onRequestClose={() => onClose?.()}
        size="mdNoHeight"
        variant="center"
      >
        <FeaturePopupHeader
          title={title}
          subtitle={subtitle}
          onClose={() => onClose?.()}
        />
        <FeaturePopupBody>
          <ZoneFormFeature />
        </FeaturePopupBody>
      </FeaturePopupShell>
    </ZoneFormProvider>
  )
}
