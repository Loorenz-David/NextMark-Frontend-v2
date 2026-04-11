import type { ApiResult } from '@shared-api'
import type { WorkspaceSwitchCommand, WorkspaceSwitchResponse } from '../contracts/driverSession.types'
import { driverApiClient } from './client'

export const driverModeApi = {
  switchWorkspace: (payload: WorkspaceSwitchCommand): Promise<ApiResult<WorkspaceSwitchResponse>> =>
    driverApiClient.request<WorkspaceSwitchResponse>({
      path: '/drivers/workspace/switch',
      method: 'POST',
      data: {
        target_workspace: payload.targetWorkspace,
      },
    }),
}
