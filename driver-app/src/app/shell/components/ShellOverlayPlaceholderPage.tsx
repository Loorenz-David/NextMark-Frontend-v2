type ShellOverlayPlaceholderPageProps = {
  title: string
  message: string
  onClose: () => void
}

export function ShellOverlayPlaceholderPage({
  title,
  message,
  onClose,
}: ShellOverlayPlaceholderPageProps) {
  return (
    <section className="shell-overlay-card">
      <div className="shell-surface__eyebrow">Overlay surface</div>
      <h2 className="shell-surface__title">{title}</h2>
      <p className="shell-surface__copy">{message}</p>
      <div className="shell-panel-actions">
        <button className="primary-button" onClick={onClose}>Close overlay</button>
      </div>
    </section>
  )
}
