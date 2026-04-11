import { AnimatePresence, motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { SegmentedRailSelector } from '@/shared/components'
import type { DriverAuthMode } from '../domain/authMode.types'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { useLoginController } from '../controllers/useLoginController.controller'

const AUTH_OPTIONS = [
  {
    id: 'login',
    label: 'Login',
    activeClassName: 'border-white/18 bg-white text-[rgb(var(--bg-app-color))]',
  },
  {
    id: 'register',
    label: 'Register',
    activeClassName: 'border-white/18 bg-white text-[rgb(var(--bg-app-color))]',
  },
] satisfies Array<{ id: DriverAuthMode; label: string; activeClassName: string }>

export function LoginPage() {
  const controller = useLoginController()

  if (controller.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const activeError = controller.mode === 'register' ? controller.registerError : controller.loginError
  const activeTimeZone = controller.mode === 'register'
    ? controller.registerFormState.timeZone
    : controller.loginFormState.timeZone
  const canSubmit = controller.mode === 'register'
    ? Boolean(
      controller.registerFormState.username.trim()
        && controller.registerFormState.email.trim()
        && controller.registerFormState.password.trim()
        && controller.registerFormState.phone.prefix.trim()
        && controller.registerFormState.phone.number.trim(),
    )
    : Boolean(
      controller.loginFormState.email.trim()
        && controller.loginFormState.password.trim(),
    )

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4 py-8 text-white sm:px-6">
      <div className="driver-auth-aurora driver-auth-aurora--one" aria-hidden="true" />
      <div className="driver-auth-aurora driver-auth-aurora--two" aria-hidden="true" />
      <div className="driver-auth-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/8 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_52%)]" />
          <div className="relative flex flex-col gap-6">
            <header className="space-y-3 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/42">Driver App</p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">Next Mark</h1>
            </header>

            <SegmentedRailSelector
              options={AUTH_OPTIONS}
              value={controller.mode}
              onChange={controller.switchMode}
              isLoading={controller.isSubmitting}
            />

            <form className="flex flex-col gap-5" onSubmit={controller.handleSubmit}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={controller.mode}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex flex-col gap-5"
                >
                  {controller.mode === 'register' ? (
                    <RegisterForm
                      formState={controller.registerFormState}
                      onUsernameChange={controller.updateRegisterUsername}
                      onEmailChange={controller.updateRegisterEmail}
                      onPasswordChange={controller.updateRegisterPassword}
                      onPhonePrefixChange={controller.updateRegisterPhonePrefix}
                      onPhoneNumberChange={controller.updateRegisterPhoneNumber}
                    />
                  ) : (
                    <LoginForm
                      formState={controller.loginFormState}
                      onEmailChange={controller.updateEmail}
                      onPasswordChange={controller.updatePassword}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {activeError ? (
                <div className="rounded-2xl border border-rose-300/24 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {activeError}
                </div>
              ) : null}

              <button
                className="h-12 rounded-2xl border border-[#8bd1c0]/24 bg-[#83ccb9] px-5 text-sm font-semibold text-[#0f2220] shadow-[0_18px_38px_rgba(131,204,185,0.28)] transition hover:bg-[#97d6c5] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={controller.isSubmitting || !canSubmit}
              >
                {controller.actionLabel}
              </button>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-xs font-medium tracking-[0.12em] text-white/46">
          Time zone <span className="mx-2 text-white/24">•</span>
          <span className="text-white/72">{activeTimeZone}</span>
        </p>
      </div>
    </section>
  )
}
