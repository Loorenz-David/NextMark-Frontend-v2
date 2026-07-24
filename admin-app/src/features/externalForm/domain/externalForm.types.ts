import type { address } from '@/types/address'
import type { Phone } from '@/types/phone'

/**
 * What the in-store device sends over the external-form room, and what the order
 * form receives.
 *
 * This is the wire contract, not the form's own shape — the form itself runs on
 * `ClientFormData` from `@client-form-kit`. Only fields the order draft can
 * actually use travel: the socket handler relays `form_data` opaquely, so an
 * extra field here would be carried all the way to the order form and dropped
 * there instead, which is a worse place to discover it.
 */
export type ExternalFormData = {
  client_first_name: string
  client_last_name: string
  client_primary_phone: Phone | null
  client_secondary_phone: Phone | null
  client_email: string
  client_address: address | null
  /**
   * The exact terms version the customer accepted at the counter, or `null` when
   * the team publishes none. It rides to the order draft and is written to the
   * order on creation — the acceptance happens here, but the order that has to
   * record it does not exist yet.
   */
  accepted_terms_version_id: number | null
  /** The customer's own opt-in, given at the counter on this device. */
  marketing_messages: boolean
}
