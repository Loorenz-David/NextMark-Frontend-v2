import { RouteGroupsPage } from "@/features/plan/routeGroup/pages/RouteGroups.page";
import { useBaseControlls } from "@/shared/resource-manager/useResourceManager";
import { SectionPanel } from "@/shared/section-panel/SectionPanel";
import { SectionManagerHost } from "../components/SectionManagerHost";
import { AnimatePresence, motion } from "framer-motion";
import { RoutePlanPage } from "@/features/plan/pages/Plan.page";
import type { PayloadBase } from "../types/types";

export const HomeMobileView = () => {

    const baseControlls = useBaseControlls<PayloadBase>()
    const routeGroupPayload = (
        baseControlls.payload && typeof baseControlls.payload.planId === 'number'
    )
        ? {
            ...baseControlls.payload,
            planId: baseControlls.payload.planId,
        }
        : null
    const windowWidth = window.innerWidth
    return ( 
        <div className="relative flex min-w-0 flex-1 overflow-hidden">
            

                <RoutePlanPage showCloseButton={false} />


            
            <AnimatePresence mode="popLayout">
                {
                baseControlls.isBaseOpen 
                ? (
                <motion.div className="absolute inset-0 z-20 h-full w-full min-w-0"
                    layout
                    key={ 'with-order' }
                    initial={{ x: windowWidth}}
                    animate={{ x: 0 }}
                    exit={{ x: windowWidth }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <SectionPanel
                        onRequestClose={ baseControlls.closeBase }
                        style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
                        >
                        {
                        routeGroupPayload &&
                        <RouteGroupsPage payload={routeGroupPayload} onRequestClose={baseControlls.closeBase} />
                        }
                    </SectionPanel>
                </motion.div>
                ) : null
            }

            </AnimatePresence>

            <SectionManagerHost
                stackKey="dynamicSectionPanels"
                isBaseOpen={baseControlls.isBaseOpen}
                containerClassName="absolute inset-0 z-30 min-w-0"
                width={windowWidth}
            />

            

        </div> 
    );
}
 
