import { useMemo, type ReactNode } from 'react'

import { useMobile } from '@/app/contexts/MobileContext'

import {
  resolveDeliveryWindowCalendarShellScale,
  type DeliveryWindowCalendarShellScaleOverrides,
  type DeliveryWindowCalendarShellSizePreset,
  type DeliveryWindowCalendarShellViewMode,
} from '../../DeliveryWindowCalendarShell.flow'
import { DeliveryWindowCalendarShellScaleProvider } from './DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarShellRenderArgs = {
  resolvedViewMode: Exclude<DeliveryWindowCalendarShellViewMode, 'auto'>
}

type DeliveryWindowCalendarShellProps = {
  viewMode?: DeliveryWindowCalendarShellViewMode
  sizePreset?: DeliveryWindowCalendarShellSizePreset
  sizeOverrides?: DeliveryWindowCalendarShellScaleOverrides
  children: (args: DeliveryWindowCalendarShellRenderArgs) => ReactNode
}

const resolveViewMode = ({
  viewMode,
  isMobile,
}: {
  viewMode: DeliveryWindowCalendarShellViewMode
  isMobile: boolean
}): Exclude<DeliveryWindowCalendarShellViewMode, 'auto'> => {
  if (viewMode === 'desktop') {
    return 'desktop'
  }
  if (viewMode === 'mobile') {
    return 'mobile'
  }
  return isMobile ? 'mobile' : 'desktop'
}

export const DeliveryWindowCalendarShell = ({
  viewMode = 'auto',
  sizePreset,
  sizeOverrides,
  children,
}: DeliveryWindowCalendarShellProps) => {
  const { isMobile } = useMobile()

  const resolvedViewMode = resolveViewMode({ viewMode, isMobile })
  const resolvedPreset = sizePreset ?? (resolvedViewMode === 'mobile' ? 'mobile' : 'desktopPopup550')

  const shellScale = useMemo(
    () =>
      resolveDeliveryWindowCalendarShellScale({
        preset: resolvedPreset,
        overrides: sizeOverrides,
      }),
    [resolvedPreset, sizeOverrides],
  )

  return (
    <DeliveryWindowCalendarShellScaleProvider value={shellScale}>
      {children({ resolvedViewMode })}
    </DeliveryWindowCalendarShellScaleProvider>
  )
}
