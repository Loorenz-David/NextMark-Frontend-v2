import { useRef } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { FeaturePopupFooter } from '@/shared/popups/featurePopup'

export type ZoneFormLayoutProps = {
  children: React.ReactNode
  isSubmitting: boolean
  isDeleting?: boolean
  onSubmit: () => void
  onDelete?: () => void
  onCancel: () => void
  submitLabel: string
}

export const ZoneFormLayout = ({
  children,
  isSubmitting,
  isDeleting = false,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel,
}: ZoneFormLayoutProps) => {
  const formRef = useRef<HTMLFormElement | null>(null)

  return (
    <>
      <form
        ref={formRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-ligth-bg)] px-4 pt-4 scroll-thin h-full pb-[84px]"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        {children}
      </form>

      <FeaturePopupFooter>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isSubmitting}
            className="rounded-xl border border-red-500/70 px-3 py-1.5 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Delete Zone"}
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <BasicButton
            params={{
              variant: "secondary",
              onClick: onCancel,
              disabled: isSubmitting || isDeleting,
              ariaLabel: "Cancel zone form",
            }}
          >
            Cancel
          </BasicButton>
          <BasicButton
            params={{
              variant: "primary",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: isSubmitting || isDeleting,
              ariaLabel: submitLabel,
            }}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </BasicButton>
        </div>
      </FeaturePopupFooter>
    </>
  )
}
