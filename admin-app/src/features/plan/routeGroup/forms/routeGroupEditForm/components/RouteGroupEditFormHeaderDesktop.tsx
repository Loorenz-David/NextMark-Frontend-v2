import { CloseIcon, ThunderIcon } from "@/assets/icons"
import { BasicButton } from "@/shared/buttons"
import { InfoHover } from "@/shared/layout/InfoHover"
import type { RouteGroupEditFormHeaderModel } from "../views/RouteGroupEditForm.views.types"
import { ROUTE_GROUP_ROUTE_SOLUTION_PREFERENCES_INFO } from "../info/routeSolutionPreferences.info"

type Props = {
 onClose: ()=>void
 header: RouteGroupEditFormHeaderModel
}
export const RouteGroupFormDesktopHeader = ({
    onClose,
    header
}: Props) => {
    return ( 
        <div className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-4">
            <div className="flex items-center gap-3">
                <div>
                    <div className="flex items-center justify-center rounded-full bg-[var(--color-border)] p-2">
                        <ThunderIcon className="h-5 w-5 text-[var(--color-muted)]"/>
                    </div>
                </div>
                <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[var(--color-text)]">{header.title}</div>
                        <InfoHover content={ROUTE_GROUP_ROUTE_SOLUTION_PREFERENCES_INFO} />
                    </div>
                    <div className="flex  text-[9px] text-[var(--color-muted)] gap-2">
                        <span>{header.variant}</span>
                        <span>/</span>
                        <span>{header.optimizationDate}</span>
                    </div>
                </div>
            </div>
           
            <BasicButton params={{
                variant:'rounded',
                onClick: onClose,
                style:{height:'35px', width:'35px'}
            }}>
                <CloseIcon className="h-4 w-4 text-[var(--color-muted)]" />
            </BasicButton>
        </div>

    );
}
