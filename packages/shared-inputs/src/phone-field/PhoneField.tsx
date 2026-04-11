import { PhoneFieldLayout } from './PhoneField.layout'
import { PhoneFieldProvider } from './PhoneField.provider'
import type { PhoneFieldProps } from './PhoneField.types'

export const PhoneField = ({
  phoneNumber,
  onChange,
  containerClassName,
  containerStyle,
  prefixPopoverClassName,
  storageNamespace,
}: PhoneFieldProps) => {
  return (
    <PhoneFieldProvider
      phoneNumber={phoneNumber}
      onChange={onChange}
      storageNamespace={storageNamespace}
    >
      <PhoneFieldLayout
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        prefixPopoverClassName={prefixPopoverClassName}
      />
    </PhoneFieldProvider>
  )
}
