import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMessageHandler } from '@shared-message-handler'
import { useSession } from '@/app/providers/session.context'
import { useDriverServices } from '@/app/providers/driverServices.context'
import type { Phone } from '@shared-domain'
import type { DriverAuthMode } from '../domain/authMode.types'
import type { DriverLoginFormState } from '../domain/loginForm.types'
import type { DriverRegisterFormState } from '../domain/registerForm.types'
import { submitDriverLoginAction } from '../actions/submitDriverLogin.action'

const detectTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const DEFAULT_PHONE_PREFIX = '+1'

const createInitialPhone = (): Phone => ({
  prefix: DEFAULT_PHONE_PREFIX,
  number: '',
})

export function useLoginController() {
  const { session, sessionState, error, login } = useSession()
  const { authRegisterApi } = useDriverServices()
  const { showMessage } = useMessageHandler()
  const [mode, setMode] = useState<DriverAuthMode>('login')
  const [registerError, setRegisterError] = useState<string>()
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginFormState, setLoginFormState] = useState<DriverLoginFormState>(() => ({
    email: '',
    password: '',
    timeZone: detectTimeZone(),
  }))
  const [registerFormState, setRegisterFormState] = useState<DriverRegisterFormState>(() => ({
    username: '',
    email: '',
    password: '',
    phone: createInitialPhone(),
    timeZone: detectTimeZone(),
  }))

  const isSubmitting = sessionState === 'authenticating' || isRegistering

  const updateEmail = (email: string) => {
    setLoginFormState((prev) => ({ ...prev, email }))
  }

  const updatePassword = (password: string) => {
    setLoginFormState((prev) => ({ ...prev, password }))
  }

  const updateRegisterUsername = (username: string) => {
    setRegisterFormState((prev) => ({ ...prev, username }))
  }

  const updateRegisterEmail = (email: string) => {
    setRegisterFormState((prev) => ({ ...prev, email }))
  }

  const updateRegisterPassword = (password: string) => {
    setRegisterFormState((prev) => ({ ...prev, password }))
  }

  const updateRegisterPhonePrefix = (prefix: string) => {
    setRegisterFormState((prev) => ({
      ...prev,
      phone: { ...prev.phone, prefix },
    }))
  }

  const updateRegisterPhoneNumber = (number: string) => {
    setRegisterFormState((prev) => ({
      ...prev,
      phone: { ...prev.phone, number },
    }))
  }

  const switchMode = (nextMode: DriverAuthMode) => {
    setMode(nextMode)
    setRegisterError(undefined)
  }

  const handleLoginSubmit = async () => {
    await submitDriverLoginAction(
      { login },
      {
        email: loginFormState.email,
        password: loginFormState.password,
        time_zone: loginFormState.timeZone,
        app_scope: 'driver',
      },
    )
  }

  const handleRegisterSubmit = async () => {
    setIsRegistering(true)
    setRegisterError(undefined)

    try {
      await authRegisterApi.register({
        username: registerFormState.username,
        email: registerFormState.email,
        password: registerFormState.password,
        phone_number: registerFormState.phone,
        time_zone: registerFormState.timeZone,
      })

      const didLogin = await login({
        email: registerFormState.email,
        password: registerFormState.password,
        time_zone: registerFormState.timeZone,
        app_scope: 'driver',
      })

      if (!didLogin) {
        setRegisterError('Account created, but automatic sign in failed. Try signing in manually.')
        setMode('login')
        setLoginFormState((prev) => ({
          ...prev,
          email: registerFormState.email,
          password: registerFormState.password,
        }))
        return
      }

      showMessage({ status: 'success', message: 'Account created. Welcome to NextMark.' })
    } catch (registerIssue) {
      const message = registerIssue instanceof Error ? registerIssue.message : 'Unable to create your account.'
      setRegisterError(message)
      showMessage({ status: 500, message })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'register') {
      await handleRegisterSubmit()
      return
    }

    await handleLoginSubmit()
  }

  const actionLabel = mode === 'register'
    ? (isSubmitting ? 'Creating account…' : 'Create account')
    : (isSubmitting ? 'Signing in…' : 'Sign in')

  return {
    isAuthenticated: Boolean(session),
    mode,
    switchMode,
    loginError: error,
    registerError,
    isSubmitting,
    loginFormState,
    registerFormState,
    updateEmail,
    updatePassword,
    updateRegisterUsername,
    updateRegisterEmail,
    updateRegisterPassword,
    updateRegisterPhonePrefix,
    updateRegisterPhoneNumber,
    handleSubmit,
    actionLabel,
  }
}
