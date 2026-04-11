import type { DriverLoginFormState } from '../domain/loginForm.types'

type LoginFormProps = {
  formState: DriverLoginFormState
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
}

export function LoginForm({
  formState,
  onEmailChange,
  onPasswordChange,
}: LoginFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
        Email
        <input
          value={formState.email}
          onChange={(event) => onEmailChange(event.target.value)}
          type="email"
          required
          autoComplete="email"
          className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
          placeholder="driver@nextmark.app"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-white/84">
        Password
        <input
          value={formState.password}
          onChange={(event) => onPasswordChange(event.target.value)}
          type="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-2xl border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/32 focus:border-white/28 focus:bg-white/10"
          placeholder="Enter your password"
        />
      </label>
    </div>
  )
}
