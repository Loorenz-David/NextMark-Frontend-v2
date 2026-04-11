import { AnimatePresence, motion } from 'framer-motion'
import { useAssignedRouteController } from '../controllers/useAssignedRouteController.controller'
import { useAssignedRouteToolbarController } from '../controllers/useAssignedRouteToolbar.controller'
import { AssignedRouteEmptyBody } from '../components/AssignedRouteEmptyBody'
import { AssignedRouteFooterAction } from '../components/AssignedRouteFooterAction'
import { AssignedRouteSearchBody } from '../components/AssignedRouteSearchBody'
import { AssignedRouteSummaryHeader } from '../components/AssignedRouteSummaryHeader'
import { AssignedRouteTimelineSurface } from '../components/AssignedRouteTimelineSurface'
import { AssignedRouteToolbar } from '../components/AssignedRouteToolbar'

const routeBodyTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function AssignedRoutePage() {
  const controller = useAssignedRouteController()
  const toolbarController = useAssignedRouteToolbarController()

  if (!controller.workspace) {
    return null
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <AssignedRouteToolbar
        isSideMenuOpen={toolbarController.isSideMenuOpen}
        mode={toolbarController.routeViewMode}
        onBackFromSearch={toolbarController.onBackFromSearch}
        onOpenThreeDotMenu={toolbarController.onOpenThreeDotMenu}
        onOpenSideMenu={toolbarController.onOpenSideMenu}
        onSearchFocus={toolbarController.onSearchFocus}
        onSearchValueChange={toolbarController.onSearchValueChange}
        searchValue={toolbarController.searchValue}
        showEmbeddedMenuButton={toolbarController.showEmbeddedMenuButton}
      />

      <AnimatePresence initial={false} mode="wait">
        {toolbarController.routeViewMode === 'search' ? (
          <AssignedRouteSearchBody key="route-search-body" />
        ) : (
          <motion.div
            key="route-body"
            animate={{ opacity: 1, y: 0 }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain "
            data-bottom-sheet-scroll-root
            exit={{ opacity: 0, y: -18 }}
            initial={{ opacity: 0, y: 0 }}
            transition={routeBodyTransition}
          >
            {controller.pageDisplay.state === 'ready' && controller.pageDisplay.summary && controller.pageDisplay.timeline ? (
              <>
                {controller.pageDisplay.timeline.stops.length > 0 ? (
                  <div className="flex min-h-full flex-col">
                    <AssignedRouteSummaryHeader summary={controller.pageDisplay.summary} />
                    <AssignedRouteTimelineSurface
                      onOpenStopDetail={controller.openStopDetail}
                      timeline={controller.pageDisplay.timeline}
                    />
                    <AssignedRouteFooterAction
                      label={controller.pageDisplay.footerLabel}
                      onPress={controller.completeRoute}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col">
                    <AssignedRouteEmptyBody />
                    <AssignedRouteFooterAction
                      label={'Add stop'}
                      placement="bottom-fixed"
                    />
                  </div>
                )}
              </>
            ) : controller.pageDisplay.state === 'loading' ? (
              <div className="px-5 py-8 text-sm text-white/65">
                Loading route...
              </div>
            ) : (
              <div className="px-5 py-8 text-sm text-white/65">
                {controller.pageDisplay.emptyMessage ?? 'No route selected.'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
