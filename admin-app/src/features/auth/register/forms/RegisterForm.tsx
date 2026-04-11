import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { PhoneField } from '@/shared/inputs/PhoneField'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'

import { useRegisterFormController } from '@/features/auth/register/controllers/useRegisterFormController'

export function RegisterForm() {
  const { fields, options, status, actions } = useRegisterFormController()


  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void actions.handleSubmit()
      }}
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <InputField
            value={fields.username}
            onChange={(event) => actions.setUsername(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" required>
          <InputField
            value={fields.email}
            onChange={(event) => actions.setEmail(event.target.value)}
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
          />
        </Field>

        <PhoneField
          phoneNumber={fields.phone}
          onChange={actions.setPhone}
        />

        <Field label="Country" required>
          <OptionPopoverSelect
            options={options.countryOptions}
            value={fields.countryCode}
            onChange={actions.setCountryCode}
            placeholder="Select country"
            allowEmpty={false}
          />
        </Field>

        <Field label="City" required>
          <div className="flex flex-col gap-2">
            <InputField
              value={fields.city}
              onChange={(event) => actions.setCity(event.target.value)}
              placeholder="Stockholm"
              autoComplete="address-level2"
            />
            <BasicButton
              params={{
                type: 'button',
                variant: 'ghost',
                onClick: () => void actions.handleUseCurrentLocation(),
                disabled: status.isDetectingLocation || status.isLoading,
                className: 'w-full justify-center text-sm',
              }}
            >
              {status.isDetectingLocation ? 'Detecting location...' : 'Use current location'}
            </BasicButton>
          </div>
        </Field>

        <Field label="Password" required>
          <InputField
            value={fields.password}
            onChange={(event) => actions.setPassword(event.target.value)}
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </Field>
      </div>

      {status.error && (
        <div className="rounded-2xl border border-rose-300/24 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {status.error}
        </div>
      )}

      <BasicButton
        params={{
          type: 'submit',
          variant: 'primary',
          disabled: status.isSubmitDisabled,
          className: 'h-12 w-full text-base shadow-[0_18px_38px_rgba(131,204,185,0.24)]',
        }}
      >
        {status.isLoading ? 'Creating account...' : 'Create account'}
      </BasicButton>
    </form>
  )
}
