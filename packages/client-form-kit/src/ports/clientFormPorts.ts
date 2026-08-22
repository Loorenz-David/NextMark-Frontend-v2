import type { ClientFormData } from '../domain/clientForm.types'
import type { ClientFormConfig } from '../domain/clientFormConfig.types'

/**
 * The outcome of a submission attempt, classified by the host.
 *
 * The kit never learns how the answers travel — the public form spends a
 * single-use token over HTTP, the in-store linked device emits over a socket —
 * so every transport-specific meaning (an expired token, a dropped connection)
 * is resolved in the host adapter and reaches the kit as one of these three.
 */
export type ClientFormSubmitResult =
  /** Accepted. The kit clears its error state and calls `onSubmitted`. */
  | { status: 'submitted' }
  /**
   * Recoverable: the customer can correct something and try again. `message` is
   * shown inline beneath the consent block. Set `refreshConfig` when the
   * rejection was caused by stale configuration — the kit then re-reads the
   * config through the port and drops any terms acceptance, keeping every
   * answer the customer already typed.
   */
  | { status: 'rejected'; message: string; refreshConfig?: boolean }
  /**
   * Unrecoverable, and the host has already taken over the screen (a dead
   * token, for instance). The kit stops without writing an error the customer
   * would never see.
   */
  | { status: 'terminated' }

export type ClientFormPorts = {
  submit: (data: ClientFormData) => Promise<ClientFormSubmitResult>
  /**
   * Re-reads the configuration. Required only by hosts that can return
   * `refreshConfig: true` — a host whose config cannot change mid-session omits it.
   */
  refreshConfig?: () => Promise<ClientFormConfig>
}

/**
 * What the surface supports, as distinct from what the team has published.
 *
 * `ClientFormConfig` is the team's configuration and is the same wherever the
 * form is opened. These are properties of the device it is opened on: a shared
 * counter tablet and a customer's own phone are not the same place, and some of
 * what is safe or wanted on one is neither on the other.
 */
export type ClientFormOptions = {
  /**
   * Namespaces the remembered phone prefix and any saved locations. A shared
   * in-store device and a customer's own browser must never share one.
   */
  storageNamespace: string
  savedLocationsIntentKey: string
  /**
   * Pins the phone field's initial prefix, bypassing the remembered-preference
   * and timezone-guess defaulting. Set this where the device's customer base is
   * known in advance — a shared counter tablet at a specific store — rather
   * than relying on whichever prefix the previous customer last picked.
   */
  defaultPhonePrefix?: string
  /**
   * Restricts the delivery address autocomplete to the given country or
   * countries (ISO 3166-1 alpha-2, e.g. `'se'`). Set this where the device's
   * delivery area is known in advance, the same way `defaultPhonePrefix` is —
   * otherwise the field suggests addresses worldwide.
   */
  addressCountryRestriction?: string | string[]
  /**
   * Offer previously used delivery addresses.
   *
   * Off for any device used by more than one customer: the suggestions are read
   * from local storage, so leaving this on would hand the previous customer's
   * address to the next person at the counter.
   */
  enableSavedLocations: boolean
  /** Show the free-text delivery note on the address step. */
  collectOrderNotes: boolean
  /** Show the marketing opt-in beside the terms checkbox. */
  collectMarketingConsent: boolean
}
