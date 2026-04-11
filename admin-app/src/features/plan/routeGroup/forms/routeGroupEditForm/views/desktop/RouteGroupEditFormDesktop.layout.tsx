import { RouteGroupEditFormFooter,  RouteGroupEditFormRouteSections } from '../../components'
import { RouteGroupEditFormDesktopRightColumn } from './RouteGroupEditFormDesktopRightColumn'
import type { RouteGroupEditFormViewProps } from '../RouteGroupEditForm.views.types'
import { RouteGroupFormDesktopHeader } from '../../components/RouteGroupEditFormHeaderDesktop'

export const RouteGroupEditFormDesktopLayout = ({
  header,
  onClose,
}: RouteGroupEditFormViewProps) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 gap-6 max-w-[950px] overflow-hidden">
      <div className="relative flex h-full w-[560px] min-w-0 shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-page)]">
         <RouteGroupFormDesktopHeader onClose={onClose} header={header} />

        <div className=" relative h-full flex flex-col min-h-0 px-4 py-4 gap-8 bg-[var(--color-ligth-bg)]">
          <RouteGroupEditFormRouteSections />
          <RouteGroupEditFormFooter />
        </div>
      </div>

      <RouteGroupEditFormDesktopRightColumn />
    </div>
  )
}
