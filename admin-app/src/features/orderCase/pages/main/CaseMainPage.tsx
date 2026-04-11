import type { StackComponentProps } from '@/shared/stack-manager/types'

import { OrderCaseList } from '@/features/orderCase/components/OrderCaseList'
import { OrderCaseMainHeader } from '@/features/orderCase/components/pageHeaders/OrderCaseMainHeader'

import { useCaseMainContext } from '../../context/main/caseMain.context'
import { CaseMainProvider } from '../../context/main/caseMain.provider'

const CaseMainPageContent = () => {
  const { cases,casesStats, caseMainActions, query } = useCaseMainContext()
  
  return (
    <div className="flex h-full w-full flex-col border-l-1 border-l-[var(--color-primary)]/30 bg-[var(--color-page)]">
      <OrderCaseMainHeader
        applySearch={caseMainActions.applySearch}
        updateFilters={caseMainActions.updateFilters}
        deleteFilter={caseMainActions.deleteFilter}
        resetQuery={caseMainActions.resetQuery}
        onClose={caseMainActions.closeCaseMain}
        orderCaseStats={casesStats}
        query={query}
      />
      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-5 pt-3">
        <OrderCaseList cases={cases} onOpenCase={caseMainActions.openCaseDetails} />
      </div>
    </div>
  )
}

export const CaseMainPage = ({ onClose }: StackComponentProps<undefined>) => {
  return (
    <CaseMainProvider onClose={onClose}>
      <CaseMainPageContent />
    </CaseMainProvider>
  )
}
