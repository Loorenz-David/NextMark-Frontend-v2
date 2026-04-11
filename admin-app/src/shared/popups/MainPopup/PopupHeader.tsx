import { useMobile } from '@/app/contexts/MobileContext'
import { BasicButton } from '@/shared/buttons/BasicButton'

import { CloseIcon } from '@/assets/icons'
import { usePopupContext } from './PopupContext'

type PropsPopupHeader = {
 
}
export const PopupHeader = ({}: PropsPopupHeader) => {
    const { isMobile } = useMobile()
    const { headerConfig, closePopup } = usePopupContext()
    if (headerConfig?.excludeHeader){
        return (
            null
        )
    }
    
    return ( 
       
            <header className={
                `flex items-center justify-between gap-4 border-b border-[var(--color-border)] ` + 
                (isMobile ? `px-4 py-4` : ` px-6 py-4`)
            }
            >       
                    {headerConfig?.icon && 
                        <div className="flex items-center justify-center rounded-full  bg-[var(--color-muted)]/20 p-3  ">
                            {headerConfig.icon}
                        </div>
                    }
    
                    <div className="flex flex-col gap-1">
                        <h2 className=" font-semibold text-[var(--color-text)]">
                            {headerConfig?.label}
                        </h2>
                        <div className=" text-xs text-[var(--color-muted)] flex">
                            {headerConfig?.description}
                        </div>
                    </div>
                     <div className=" flex items-center justify-end flex-1">
                        <BasicButton params={{
                            variant: 'rounded',
                            onClick: closePopup
                        }}
                        >
                            <CloseIcon className={"h-6 w-6 app-icon"} />
                        </BasicButton>
                    </div>
            </header>

    );
}