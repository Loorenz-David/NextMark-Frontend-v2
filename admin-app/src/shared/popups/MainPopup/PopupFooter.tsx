import { useMobile } from '@/app/contexts/MobileContext'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type { PropsFooterConfig } from './MainPopup.types'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'



type PropsPopupFooter = {
    footerConfig?: PropsFooterConfig | null
}

export const PopupFooter = ({ footerConfig }: PropsPopupFooter) => {
    const { isMobile } = useMobile()
    const hasButtons = footerConfig?.saveButton || footerConfig?.deleteButton

    if (!hasButtons) return null

    return ( 
        <footer className={
            ` absolute bottom-0 flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] bottom-0 left-0 bg-[var(--color-page)] rounded-b-xl ` + 
            (isMobile ? `px-4 py-4` : ` px-6 py-4 pt-3`)
        }
        >       
            
            { footerConfig?.deleteButton && footerConfig?.deleteButton?.action &&
                 <ConfirmActionButton
                    onConfirm={footerConfig.deleteButton.action}
                    deleteContent={footerConfig.deleteButton.label ?? 'Delete'}
                    confirmContent={"Confirm Deletion"}
                    deleteClassName={"text-sm rounded-md bg-[var(--color-page)] text-red-500 border-[text-red-500] px-2 py-2"}
                    confirmClassName={"text-sm rounded-md bg-red-500 py-2 px-2 text-white"}
                />
            }


               
                {footerConfig?.saveButton && (
                    <div className="flex flex-1 justify-end">
                        <BasicButton params={{
                            variant: 'primary',
                            className:'py-2 px-5',
                            onClick: footerConfig.saveButton.action
                        }}>
                            {footerConfig.saveButton.label}
                        </BasicButton>
                    </div>
                )}

        </footer>
    );
}
