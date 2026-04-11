import { ModeSwitcher } from '@/features/driver-mode'
import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'

type DriverMenuPageProps = {
  workspace: DriverWorkspaceContext | null
  onOpenShellHelp: () => void
  onSignOut: () => void
}

export function DriverMenuPage({ workspace, onOpenShellHelp, onSignOut }: DriverMenuPageProps) {
  return (
    <section className="shell-menu-page">
      <div className="shell-surface__eyebrow">Side menu</div>
      <h2 className="shell-surface__title">Driver controls</h2>
      <p className="shell-surface__copy">
        Navigation, workspace controls, and account actions belong here.
      </p>

      <article className="shell-panel-card">
        <div className="driver-kicker">Current workspace</div>
        <strong>{workspace?.currentWorkspace ?? 'No active workspace'}</strong>
        <p className="driver-subtitle">Team id: {workspace?.teamId ?? 'not set'}</p>
      </article>

      <ModeSwitcher />

      <div className="shell-panel-actions">
        <button className="ghost-button" onClick={onOpenShellHelp}>Open overlay demo</button>
        <button className="danger-button" onClick={onSignOut}>Sign out</button>
      </div>
    </section>
  )
}
