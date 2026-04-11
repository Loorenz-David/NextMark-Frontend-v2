import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { BasicButton } from '@/shared/buttons/BasicButton'

import { useLoginMutations } from '@/features/auth/login/hooks/useLoginMutations'
import { useAuthError, useAuthLoading } from '@/features/auth/login/hooks/useAuthSelectors'


export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useLoginMutations()
  const isLoading = useAuthLoading()
  const error = useAuthError()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const response = await login({ email, password, time_zone: timeZone, app_scope: 'admin' })
    if ( response ){
      navigate('/')
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={ handleSubmit }
    >
      <div className="space-y-4">
        <Field label="Email" required>
          <InputField
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Password" required>
          <InputField
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-300/24 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <BasicButton
        params={{
          type: 'submit',
          variant: 'primary',
          disabled: isLoading || !email || !password,
          className: 'h-12 w-full text-base shadow-[0_18px_38px_rgba(131,204,185,0.24)]',
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </BasicButton>
    </form>
  )
}
