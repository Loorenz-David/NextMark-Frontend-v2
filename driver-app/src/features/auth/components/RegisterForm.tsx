import type { DriverRegisterFormState } from '../domain/registerForm.types'

type RegisterFormProps = {
  formState: DriverRegisterFormState
  onUsernameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onPhonePrefixChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
}

export function RegisterForm({
  formState,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onPhonePrefixChange,
  onPhoneNumberChange,
}: RegisterFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
        Name
        <input
          value={formState.username}
          onChange={(event) => onUsernameChange(event.target.value)}
          type="text"
          required
          autoComplete="name"
          className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
          placeholder="Jane Driver"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
        Email
        <input
          value={formState.email}
          onChange={(event) => onEmailChange(event.target.value)}
          type="email"
          required
          autoComplete="email"
          className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
          placeholder="jane@nextmark.app"
        />
      </label>

      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
          Prefix
          <input
            value={formState.phone.prefix}
            onChange={(event) => onPhonePrefixChange(event.target.value)}
            type="tel"
            required
            autoComplete="tel-country-code"
            className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
            placeholder="+1"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
          Phone
          <input
            value={formState.phone.number}
            onChange={(event) => onPhoneNumberChange(event.target.value)}
            type="tel"
            required
            autoComplete="tel-national"
            className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
            placeholder="555 123 4567"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
        Password
        <input
          value={formState.password}
          onChange={(event) => onPasswordChange(event.target.value)}
          type="password"
          required
          autoComplete="new-password"
          className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
          placeholder="Create a password"
        />
      </label>
    </div>
  )
}
