import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from '@/assets/icons'
import { AssignedRouteSearchField } from './AssignedRouteSearchField'
import { AssignedRouteToolbarMenuButton } from './AssignedRouteToolbarMenuButton'
import { ThreeDotMenu } from './ThreeDotMenu/ThreeDotMenu'

type AssignedRouteToolbarProps = {
  isSideMenuOpen: boolean
  mode: 'route' | 'search'
  searchValue: string
  showEmbeddedMenuButton: boolean
  onBackFromSearch: () => void
  onOpenThreeDotMenu: () => void
  onOpenSideMenu: () => void
  onSearchValueChange: (value: string) => void
  onSearchFocus?: () => void
}

const menuPresenceTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function AssignedRouteToolbar({
  isSideMenuOpen,
  mode,
  searchValue,
  showEmbeddedMenuButton,
  onBackFromSearch,
  onOpenThreeDotMenu,
  onOpenSideMenu,
  onSearchValueChange,
  onSearchFocus,
}: AssignedRouteToolbarProps) {
  const isSearchMode = mode === 'search'

  return (
    <div className="sticky top-0 z-[1]  pb-2 pt-1">
      <div className={`route-toolbar-layout ${showEmbeddedMenuButton ? 'is-menu-visible' : ''}`}>
        <div className={`route-toolbar-menu-slot ${showEmbeddedMenuButton ? 'is-visible' : ''}`}>
          <AnimatePresence initial={false}>
            {showEmbeddedMenuButton ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                initial={{ opacity: 0, y: 100 }}
                key="toolbar-menu-button"
                transition={menuPresenceTransition}
              >
                <AssignedRouteToolbarMenuButton
                  isOpen={isSideMenuOpen}
                  onClick={onOpenSideMenu}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="min-w-0">
          <AssignedRouteSearchField
            autoFocus={isSearchMode}
            onChange={onSearchValueChange}
            onFocus={onSearchFocus}
            placeholder={isSearchMode ? 'Search destination or route' : 'Search route'}
            readOnly={!isSearchMode}
            value={searchValue}
          />
        </div>

        {isSearchMode ? (
          <div className="route-toolbar-action-slot">
            <button
              aria-label="Close search"
              className="flex h-10 w-10 shrink-0 items-center justify-center text-white/84"
              onClick={onBackFromSearch}
              type="button"
            >
              <CloseIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="route-toolbar-action-slot">
            <ThreeDotMenu onClick={onOpenThreeDotMenu} />
          </div>
        )}
      </div>
    </div>
  )
}
