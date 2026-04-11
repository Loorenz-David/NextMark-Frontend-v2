import { AssignedRoutePage, StopDetailPage } from '@/features/route-execution'
import { memo, useEffect, useRef } from 'react'
import { useDriverAppShellChromeController } from '../controllers/useDriverAppShellChrome.controller'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { useBottomSheetSurfaceController } from '../controllers/useBottomSheetSurface.controller'
import { BottomSheetInteractionButtons } from './BottomSheetInteractionButtons'
import type { BottomSheetStackEntry } from '../domain/shell.types'

const BottomSheetPageContent = memo(function BottomSheetPageContent({
  currentPage,
  onBack,
}: {
  currentPage: BottomSheetStackEntry | null
  onBack: () => void
}) {
  if (currentPage?.page === 'route-workspace') {
    return <AssignedRoutePage />
  }

  if (currentPage?.page === 'route-stop-detail') {
    return (
      <StopDetailPage
        stopClientId={currentPage.params.stopClientId}
        onBack={onBack}
      />
    )
  }

  return null
})

export function BottomSheetSurface() {
  const controller = useBottomSheetSurfaceController()
  const chromeController = useDriverAppShellChromeController()
  const { handleSurfaceBack } = useDriverAppShell()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)

  const currentPage = controller.currentPage
  const {
    handleContentTouchCancel,
    handleContentTouchEnd,
    handleContentTouchMove,
    handleContentTouchStart,
  } = controller

  useEffect(() => {
    const contentElement = contentRef.current
    if (!contentElement) {
      return
    }

    const handleTouchStart = (event: TouchEvent) => {
      handleContentTouchStart(event, contentElement)
    }

    const handleTouchMove = (event: TouchEvent) => {
      handleContentTouchMove(event)
    }

    const handleTouchEnd = () => {
      handleContentTouchEnd()
    }

    const handleTouchCancel = () => {
      handleContentTouchCancel()
    }

    contentElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    contentElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    contentElement.addEventListener('touchend', handleTouchEnd, { passive: true })
    contentElement.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      contentElement.removeEventListener('touchstart', handleTouchStart)
      contentElement.removeEventListener('touchmove', handleTouchMove)
      contentElement.removeEventListener('touchend', handleTouchEnd)
      contentElement.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [
    handleContentTouchCancel,
    handleContentTouchEnd,
    handleContentTouchMove,
    handleContentTouchStart,
  ])

  return (
    <section
      ref={sheetRef}
      aria-label="Bottom sheet workspace"
      className={`driver-bottom-sheet driver-bottom-sheet--${controller.snap} bg-[rgba(var(--bg-app-color),0.70)] backdrop-blur-[18px] backdrop-saturate-[115%] backdrop-contrast-[92%]${controller.motionState === 'snapping' ? ' is-snapping' : ''}`}
      style={{ height: `${controller.heightPercent}%` }}
    >
      <BottomSheetInteractionButtons
        shouldRender={chromeController.shouldRenderOverSheetChrome}
        opacity={chromeController.overSheetChromeOpacity}
        translateYPx={chromeController.overSheetChromeTranslateYPx}
        isInteractive={chromeController.isOverSheetChromeInteractive}
        isLocatingCurrentLocation={chromeController.isLocatingCurrentLocation}
        onLocateCurrentLocation={() => {
          void chromeController.locateCurrentLocation()
        }}
      />

      <div
        className="driver-bottom-sheet__handle"
        onPointerDown={controller.handlePointerDown}
        role="presentation"
      >
        <span />
      </div>

      <div
        ref={contentRef}
        className="driver-bottom-sheet__content"
      >
        <BottomSheetPageContent currentPage={currentPage} onBack={handleSurfaceBack} />
      </div>
    </section>
  )
}
