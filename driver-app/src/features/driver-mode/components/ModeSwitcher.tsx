import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { DriverWorkspaceKind } from '@/app/contracts/driverSession.types'
import { useWorkspace } from '@/app/providers/workspace.context'

export function ModeSwitcher() {
  const { workspace, isSwitchingWorkspace, switchWorkspaceError, switchWorkspace } = useWorkspace()
  const [targetWorkspace, setTargetWorkspace] = useState<DriverWorkspaceKind>(workspace?.currentWorkspace ?? 'personal')

  const helperText = useMemo(() => (
    targetWorkspace === 'personal'
      ? 'Personal workspace can expose quick route and order creation.'
      : 'Team mode restricts creation and focuses on assigned route execution.'
  ), [targetWorkspace])

  if (!workspace) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await switchWorkspace({
      targetWorkspace,
    })
  }

  return (
    <section className="mode-switcher">
      <div>
        <div className="driver-kicker">Workspace mode</div>
        <strong>{workspace.currentWorkspace}</strong>
        <p className="driver-subtitle">{helperText}</p>
      </div>

      <form className="mode-switcher__form" onSubmit={handleSubmit}>
        <select value={targetWorkspace} onChange={(event) => setTargetWorkspace(event.target.value as DriverWorkspaceKind)}>
          <option value="personal">Personal</option>
          <option disabled={!workspace.hasTeamWorkspace && workspace.currentWorkspace !== 'team'} value="team">Team</option>
        </select>
        <button className="primary-button" type="submit" disabled={isSwitchingWorkspace}>
          {isSwitchingWorkspace ? 'Switching…' : 'Switch workspace'}
        </button>
      </form>

      {switchWorkspaceError ? <p className="form-error">{switchWorkspaceError}</p> : null}
    </section>
  )
}
