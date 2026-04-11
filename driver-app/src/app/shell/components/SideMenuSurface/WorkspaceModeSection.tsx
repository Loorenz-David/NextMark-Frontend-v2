import type { DriverWorkspaceKind } from '@/app/contracts/driverSession.types'
import { useWorkspace } from '@/app/providers/workspace.context'
import { SegmentedRailSelector } from '@/shared/components'
import { useMessageHandler } from '@shared-message-handler'

const ROLE_OPTIONS: Array<{
  id: DriverWorkspaceKind
  label: string
  activeClassName: string
}> = [
  {
    id: 'team',
    label: 'Team',
    activeClassName: 'border-cyan-200/30 bg-cyan-300/20 text-cyan-100',
  },
  {
    id: 'personal',
    label: 'Personal',
    activeClassName: 'border-emerald-200/30 bg-emerald-300/20 text-emerald-100',
  },
]

export function WorkspaceModeSection() {
  const { workspace, isSwitchingWorkspace, switchWorkspaceError, switchWorkspace } = useWorkspace()
  const { showMessage } = useMessageHandler()

  if (!workspace) {
    return null
  }

  return (
    <section className=" px-2 pb-4 pt-1">

      <div className="mt-1">
        <SegmentedRailSelector
          isLoading={isSwitchingWorkspace}
          onChange={(nextWorkspace) => {
            if (nextWorkspace === 'team' && !workspace.hasTeamWorkspace && workspace.currentWorkspace !== 'team') {
              showMessage({
                status: 'warning',
                message: 'Team workspace becomes available after you join a team. Your personal workspace stays separate from team work.',
              })
              return
            }

            void switchWorkspace({
              targetWorkspace: nextWorkspace,
            })
          }}
          options={ROLE_OPTIONS}
          value={workspace.currentWorkspace}
        />
      </div>

      {switchWorkspaceError ? (
        <p className="mt-3 text-xs text-rose-300">{switchWorkspaceError}</p>
      ) : null}
    </section>
  )
}
