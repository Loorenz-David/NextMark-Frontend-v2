import { useNavigate } from 'react-router-dom'

import { BasicButton } from '@/shared/buttons/BasicButton'

export const ExternalFormAccessPage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#111819] p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-14%] top-[-12%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(131,204,185,0.22),transparent_66%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-18%] right-[-10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(102,168,255,0.16),transparent_68%)] blur-3xl"
      />

      <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,31,32,0.96),rgba(13,21,22,0.94))] shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
        <div className="border-b border-white/8 px-8 py-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#83ccb9]/68">
            External Form
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white">
            Customer Form Access
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/56">
            Open the public customer form experience used to collect client, contact, and delivery
            details.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/42">
                Step 1
              </p>
              <p className="mt-3 text-base font-medium text-white/88">Client identity</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/42">
                Step 2
              </p>
              <p className="mt-3 text-base font-medium text-white/88">Contact details</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/42">
                Step 3
              </p>
              <p className="mt-3 text-base font-medium text-white/88">Delivery address</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
            <p className="max-w-md text-sm text-white/48">
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
