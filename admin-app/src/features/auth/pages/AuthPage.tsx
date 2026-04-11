import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useLocation } from 'react-router-dom'

import { AuthSwitch } from '@/features/auth/components/AuthSwitch'
import { LoginForm } from '@/features/auth/login/forms/LoginForm'
import { RegisterForm } from '@/features/auth/register/forms/RegisterForm'

export function AuthPage() {
  const location = useLocation()

  if (location.pathname === '/auth') {
    return <Navigate to="/auth/login" replace />
  }

  const isRegister = location.pathname.includes('/auth/register')

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131a1b] px-4 py-8 text-white sm:px-6">
      <div className="admin-auth-aurora admin-auth-aurora--one" aria-hidden="true" />
      <div className="admin-auth-aurora admin-auth-aurora--two" aria-hidden="true" />
      <div className="admin-auth-grid" aria-hidden="true">
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_54%)]" />
          <div className="relative flex flex-col gap-6">
            <header className="space-y-3 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/42">
                Next Mark Admin
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
                Admin panel access
              </h1>
              <p className="text-sm leading-6 text-white/62">
                Sign in to manage orders, plans, automations, settings, and the rest of your Next
                Mark workspace from one control surface.
              </p>
            </header>

            <AuthSwitch />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isRegister ? 'register' : 'login'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex flex-col gap-5"
              >
                {isRegister ? <RegisterForm /> : <LoginForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-xs font-medium tracking-[0.12em] text-white/46">
          Secure workspace access for operators, dispatchers, and admins
        </p>
      </div>
    </section>
  )
}
