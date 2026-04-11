import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

export const DeliveryWindowCalendarEditorPlaceholder = () => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { editor } = shellScale

  return (
    <div className={editor.rootClassName}>
      <div className={editor.titleClassName}>Set time window</div>
      <p className="mt-2 text-[var(--color-muted)] text-xs ">
        Select one or more dates to configure a delivery window.
      </p>
    </div>
  )
}
