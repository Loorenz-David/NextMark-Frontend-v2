import { CloseIcon } from '@/assets/icons'
import type { PhoneCallOption } from '@/app/services/phoneCall.service'
import { usePhoneCallChooserController } from '../controllers/usePhoneCallChooser.controller'
import { PhoneCallChooserList } from '../components/phone-chooser'

type PhoneCallChooserPageProps = {
  options: PhoneCallOption[]
  onClose: () => void
}

export function PhoneCallChooserPage({
  options,
  onClose,
}: PhoneCallChooserPageProps) {
  const controller = usePhoneCallChooserController({
    options,
    onClose,
  })

  return (
    <section className="flex min-h-[20vh] flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Call phone</h2>
          <p className="mt-1 text-sm text-white/60">Choose which number to call.</p>
        </div>

        <button
          aria-label="Close phone chooser"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div
        className="flex flex-1 flex-col gap-4 px-5 py-5"
        data-bottom-sheet-gesture-lock="true"
      >
        <PhoneCallChooserList
          onSelectOption={controller.selectPhone}
          options={controller.options}
        />
      </div>
    </section>
  )
}
