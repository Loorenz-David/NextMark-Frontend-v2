/**
 * Where the installed customer-form app is allowed to be.
 *
 * A tab has an address bar and a back button; an installed app has neither. If
 * the tablet ever ends up on an admin route there is no way for the person at
 * the counter to get back, and — worse — the admin console is then sitting
 * open on a customer-facing device. So this pins the installed app to the route
 * it was installed for.
 *
 * `/auth` is allowed, and it is not a loose end. The form route is behind
 * `ProtectedRoute`, which redirects an unauthenticated visit to `/auth/login`.
 * Containment that bounced that redirect back would fight it forever and hang
 * the tablet on an empty screen instead of showing the login it needs. Signing
 * in is the one legitimate way off the form route, and it lands back on it.
 *
 * This is a guard, not a security boundary: the tablet still holds a full admin
 * session, and only device-scoped authentication fixes that.
 */

import { EXTERNAL_FORM_PATH, isExternalFormPath } from './externalFormPwa'

const AUTH_PATH = '/auth'

const isAuthPath = (pathname: string): boolean =>
  pathname === AUTH_PATH || pathname.startsWith(`${AUTH_PATH}/`)

export type ContainmentInput = {
  /**
   * True only when this document is an installed app *and* it was launched into
   * the external form. An installed admin surface, if one ever exists, must not
   * be dragged onto the form route by this rule.
   */
  armed: boolean
  pathname: string
}

/**
 * The path to `replace` to, or `null` to leave navigation alone.
 *
 * Returns `null` for every child of `/external-form`, so ordinary back and
 * forward movement inside the form keeps working untouched.
 */
export const resolveContainmentRedirect = ({
  armed,
  pathname,
}: ContainmentInput): string | null => {
  if (!armed) return null
  if (isExternalFormPath(pathname)) return null
  if (isAuthPath(pathname)) return null
  return EXTERNAL_FORM_PATH
}

/**
 * Arming is decided once, from where the app was launched, rather than followed
 * live — otherwise a single stray navigation would disarm the guard exactly when
 * it is needed.
 */
export const isContainmentArmed = ({
  standalone,
  launchPathname,
}: {
  standalone: boolean
  launchPathname: string
}): boolean => standalone && isExternalFormPath(launchPathname)
