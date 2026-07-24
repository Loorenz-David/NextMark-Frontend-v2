import { useNavigate } from 'react-router-dom'

import { BasicButton } from '@/shared/buttons/BasicButton'

export const ExternalFormAccessPage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#111819] p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-14%] top-[-12%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-primary)_22%,transparent),transparent_66%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-18%] right-[-10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(102,168,255,0.16),transparent_68%)] blur-3xl"
      />

      <section className="relative w-full max-w-2xl overflow-hidden rounded-4xl border border-border bg-[linear-gradient(180deg,rgba(var(--theme-surface-external-r),0.96),rgba(var(--theme-surface-shell-top-r),0.94))] shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
        <div className="border-b border-border-subtle px-8 py-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#83ccb9]/68">
            External Form
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-text">
            Customer Form Access
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-faint">
            Open the public customer form experience used to collect client, contact, and delivery
            details.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-surface-raised p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-faint">
                Step 1
              </p>
              <p className="mt-3 text-base font-medium text-text">Client identity</p>
            </div>
            <div className="rounded-3xl border border-border bg-surface-raised p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-faint">
                Step 2
              </p>
              <p className="mt-3 text-base font-medium text-text">Contact details</p>
            </div>
            <div className="rounded-3xl border border-border bg-surface-raised p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-faint">
                Step 3
              </p>
              <p className="mt-3 text-base font-medium text-text">Delivery address</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
            <p className="max-w-md text-sm text-faint">
              The form opens in its dedicated public-style shell and is ready for live customer
              input.
            </p>
            <BasicButton
              params={{
                variant: 'primary',
                onClick: () => {
                  navigate('/external-form')
                },
              }}
            >
              Go to External Form
            </BasicButton>
          </div>
        </div>
      </section>
    </div>
  )
}
