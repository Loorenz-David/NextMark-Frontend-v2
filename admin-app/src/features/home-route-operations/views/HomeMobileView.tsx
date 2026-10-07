import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'

import { isHomeMobileShellTab, useHomeMobileShellStore } from '@/features/home-app'
import { SectionPanel } from '@/shared/section-panel/SectionPanel'
import { useBaseControlls, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'

import { SectionManagerHost } from '../components/SectionManagerHost'
import { PlanWorkspacePanel } from '../components/PlanWorkspacePanel'
import { OrderSelectionActionBar } from '../components/mobile/OrderSelectionActionBar'
import { useActivePlanWorkspace } from '../flows/useActivePlanWorkspace.flow'
import { homeMobileTabRegistry } from '../registry/homeMobileTabs'
import type { PayloadBase } from '../types/types'

const PAGE_SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const

/**
 * Route-operations on a phone: the plans and orders tab roots live in the
 * shell's content slot; the plan workspace panel and the section stack push
 * over the whole screen as full pages with their own headers.
 *
 * The page layer is portalled to `document.body`: the workspace sits inside
 * a `z-10` stacking context, so a `fixed` layer rendered in place would
 * paint under the shell's tab bar.
 */
export const HomeMobileView = () => {
  const { activeTab, mountedTabs } = useHomeMobileShellStore(
    useShallow((state) => ({ activeTab: state.activeTab, mountedTabs: state.mountedTabs })),
  )
  const baseControlls = useBaseControlls<PayloadBase>()
  const planWorkspace = useActivePlanWorkspace(baseControlls)
  const sectionManager = useSectionManager()
  const sectionEntries = useStackActionEntries(sectionManager)
  const hasOpenSections = sectionEntries.some((entry) => !entry.isClosing)
  const isCovered = baseControlls.isBaseOpen || hasOpenSections
  const workspaceTabs = mountedTabs.filter((tab) => !isHomeMobileShellTab(tab))

  const pageLayer = (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence mode="popLayout">
        {baseControlls.isBaseOpen ? (
          <motion.div
            key="plan-workspace"
            className="safe-top pointer-events-auto absolute inset-0 z-10 flex min-w-0 flex-col bg-[var(--color-page)]"
            // Every keyframe in the same unit: mixing '100%' with 0 makes
            // framer-motion convert units by measuring, which lands short.
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={PAGE_SPRING}
          >
            <SectionPanel
              onRequestClose={baseControlls.closeBase}
              style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
            >
              <PlanWorkspacePanel
                workspace={planWorkspace}
                payload={baseControlls.payload}
                onRequestClose={baseControlls.closeBase}
              />
            </SectionPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SectionManagerHost
        stackKey="dynamicSectionPanels"
        isBaseOpen={baseControlls.isBaseOpen}
        containerClassName="safe-top absolute inset-0 z-20 min-w-0"
        activeContainerClassName="bg-[var(--color-page)]"
        width="full"
      />
    </div>
  )

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {workspaceTabs.map((tab) => {
        const TabRoot = homeMobileTabRegistry[tab]
        const isActive = tab === activeTab
        return (
          <div
            key={tab}
            role="tabpanel"
            aria-hidden={!isActive}
            inert={!isActive || isCovered}
            className={`absolute inset-0 flex min-h-0 flex-col overflow-hidden ${
              isActive ? '' : 'invisible pointer-events-none'
            }`}
          >
            <SectionPanel>
              <TabRoot />
            </SectionPanel>
          </div>
        )
      })}

      {activeTab === 'orders' && !isCovered ? <OrderSelectionActionBar /> : null}

      {typeof document !== 'undefined' ? createPortal(pageLayer, document.body) : null}
    </div>
  )
}
