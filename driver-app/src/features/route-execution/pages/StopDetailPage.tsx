import { AnimatePresence, motion } from 'framer-motion'
import { useStopDetailController } from '../controllers/useStopDetailController.controller'
import { StopDetailBody, StopDetailHeader } from '../components/stop-detail'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'

type StopDetailPageProps = {
  stopClientId?: string
  onBack: () => void
}

const stopDetailPanelVariants = {
  enter: (direction: 1 | -1) => ({
    x: `${direction * 100}%`,
  }),
  center: {
    x: '0%',
  },
  exit: (direction: 1 | -1) => ({
    x: `${direction * -100}%`,
  }),
}

export function StopDetailPage({ stopClientId, onBack }: StopDetailPageProps) {
  const controller = useStopDetailController(stopClientId)
  const { stopDetailTransitionDirection } = useRouteExecutionShell()
  const motionDirection = stopDetailTransitionDirection === 'backward' ? -1 : 1

  if (!controller.route || !controller.stop || !controller.pageDisplay) {
    return (
      <section className="px-5 py-6">
        <div className="rounded-3xl border border-white/12 bg-white/6 px-4 py-5 text-sm text-white/70">
          Stop not found for the current workspace.
          <div className="mt-4">
            <button className="rounded-xl border border-white/20 px-4 py-2 text-white" onClick={onBack} type="button">Back to route</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <AnimatePresence custom={motionDirection} initial={false} mode="sync">
        <motion.div
          animate="center"
          custom={motionDirection}
          key={stopClientId ?? 'missing-stop'}
          className="absolute inset-0 flex min-h-0 flex-col"
          exit="exit"
          initial="enter"
          transition={{ duration: 0.4, ease: [0.22, 0.8, 0.2, 1] }}
          variants={stopDetailPanelVariants}
        >
          <StopDetailHeader
            header={controller.pageDisplay.header}
            headerMode={controller.pageDisplay.headerMode}
            onClose={onBack}
            primaryActions={controller.pageDisplay.primaryActions}
            terminalStatus={controller.pageDisplay.terminalStatus}
          />
          <StopDetailBody rows={controller.pageDisplay.infoRows} orderNotes={controller.pageDisplay.orderNotes} />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
