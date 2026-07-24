import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { BasicButton } from '@/shared/buttons/BasicButton'

const tabs = [
  { label: 'Login', path: '/auth/login' },
  { label: 'Register', path: '/auth/register' },
]

export function AuthSwitch() {
  const location = useLocation()
  const navigate = useNavigate()

  const activePath = useMemo(() => {
    if (location.pathname.includes('/auth/register')) {
      return '/auth/register'
    }
    return '/auth/login'
  }, [location.pathname])

  return (
    <div className="rounded-3xl border border-border bg-surface-hover p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="grid grid-cols-2 gap-2">
      {tabs.map((tab) => {
        const isActive = activePath === tab.path
        return (
          <BasicButton
            key={tab.path}
            params={{
              type: 'button',
              variant: isActive ? 'secondaryInvers' : 'ghost',
              onClick: () => navigate(tab.path),
              className: `w-full rounded-2xl py-2.5 text-sm ${
                isActive
                  ? 'border-[#83ccb9]/32 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_18%,transparent),rgba(94,209,215,0.10))] text-[#d8fff3] shadow-[inset_0_1px_0_var(--rule-subtle)]'
                  : 'text-muted hover:bg-surface-raised'
              }`,
            }}
          >
            {tab.label}
          </BasicButton>
        )
      })}
      </div>
    </div>
  )
}
