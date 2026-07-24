import {
  EMPTY_CLIENT_FORM_CONFIG,
  mapClientFormConfig,
  type ClientFormConfig,
} from '@client-form-kit'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

type ClientFormProjectionResponse = {
  client_form_config: unknown
}

/**
 * The team's client-form configuration, as the in-store device needs it.
 *
 * The public link receives this from its token route; the device is
 * authenticated and reads the same projection, built by the same backend code
 * and parsed by the same mapper the public form uses. Nothing about the form's
 * contents is assembled twice, so the counter and the emailed link cannot drift
 * into showing different terms, rules or media.
 */
export const fetchLinkedDeviceClientFormConfig =
  async (): Promise<ClientFormConfig> => {
    const result: ApiResult<ClientFormProjectionResponse> =
      await apiClient.request<ClientFormProjectionResponse>({
        path: '/client_form_config/projection',
        method: 'GET',
      })

    if (!result.data) {
      return EMPTY_CLIENT_FORM_CONFIG
    }

    return mapClientFormConfig(result.data.client_form_config)
  }
