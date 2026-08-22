/**
 * Pins the installed customer-form app to its own route family.
 *
 * Inert in a browser tab, and inert in an installed app that did not launch into
 * the form — so this costs the admin console nothing.
 */

import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  isContainmentArmed,
  resolveContainmentRedirect,
} from './domain/standaloneContainment'
import {
  isStandaloneDisplay,
  readStandaloneDisplayEnvironment,
} from './domain/standaloneDisplay'

export const useStandaloneContainment = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Read once: the launch path is the question, and it stops being answerable
  // the moment the app navigates.
  const armedRef = useRef<boolean | null>(null)
  if (armedRef.current === null) {
    armedRef.current = isContainmentArmed({
      standalone: isStandaloneDisplay(readStandaloneDisplayEnvironment()),
      launchPathname: pathname,
    })
  }

  useEffect(() => {
    const target = resolveContainmentRedirect({
      armed: armedRef.current === true,
      pathname,
    })
    if (!target) return

    // `replace` rather than `push`: the entry we are rejecting must not stay in
    // history for a back gesture to return to.
    navigate(target, { replace: true })
  }, [navigate, pathname])
}
