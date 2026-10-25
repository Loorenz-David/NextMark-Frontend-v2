import { DROP_SURFACE_ATTRIBUTE } from '../domain/dropSurface'
import type { ActivePlanWorkspace } from '../flows/useActivePlanWorkspace.flow'
import type { PayloadBase } from '../types/types'

type PlanWorkspacePanelProps = {
  workspace: ActivePlanWorkspace
  payload: PayloadBase | null
  onRequestClose?: () => void
}

/**
 * The body of the plan workspace panel, shared by the desktop and mobile shells.
 * Which page renders is decided by the plan's type; until the plan is known the
 * panel holds a placeholder rather than committing to a workspace.
 */
export const PlanWorkspacePanel = ({
  workspace,
  payload,
  onRequestClose,
}: PlanWorkspacePanelProps) => {
  if (workspace.status !== 'ready' || !payload) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-sm text-[var(--color-muted)]">
          {workspace.status === 'resolving' ? 'Opening plan…' : null}
        </span>
      </div>
    )
  }

  const { Workspace } = workspace

  // The panel covers the plan list, whose cards stay live drop targets;
  // marking it a drop surface keeps drags over the panel off them.
  return (
    <div className="contents" {...{ [DROP_SURFACE_ATTRIBUTE]: '' }}>
      <Workspace
        payload={{
          ...payload,
          planId: payload.planId ?? undefined,
        }}
        onRequestClose={onRequestClose}
      />
    </div>
  )
}
