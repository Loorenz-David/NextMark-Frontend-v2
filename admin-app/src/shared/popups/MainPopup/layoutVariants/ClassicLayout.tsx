
import { motion, AnimatePresence } from 'framer-motion'
import { useMobile } from '@/app/contexts/MobileContext'

import { usePopupContext } from '../PopupContext'
import { PopupHeader } from '../PopupHeader'
import { PopupBody } from '../PopupBody'
import { ConfirmActionPopup } from '@/shared/popups/ConfirmActionPopup'

type PropsMainPopupLayout = {
    children: React.ReactNode,
}

export const MainPopupLayout = ({ children }: PropsMainPopupLayout) => {
    const {isMobile} = useMobile()

    const { closeState, confirmClose, cancelClose, closePopup, parentParams } = usePopupContext()
    return (  
        <div className="fixed inset-0 z-[100] flex items-center justify-center">

            {/* Overlay */}
            {!isMobile && 
                <motion.div
                    className="absolute inset-0 popup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={closePopup}
                />
            }

            {/* Popup element */}
            <motion.div
                className={isMobile ?`relative z-100 pointer-events-auto flex h-full w-full  flex-col  bg-[var(--color-page)] text-[var(--color-text)]`:
                parentParams?.autoHeight
                    ? 'relative z-10 pointer-events-auto flex w-full max-h-[calc(100vh-48px)] max-w-[600px] min-w-[500px] flex-col bg-[var(--color-page)] text-[var(--color-text)] rounded-none md:rounded-3xl'
                : parentParams && parentParams?.controllBodyLayout
                    ? 'relative z-10 pointer-events-auto flex h-full  flex-col rounded-none   text-[var(--color-text)] md:rounded-3xl' 
                    :`relative z-10 pointer-events-auto flex h-full  max-h-[800px] max-w-[600px] min-w-[500px] bg-[var(--color-page)]  flex-col rounded-none   text-[var(--color-text)] md:rounded-3xl`
                }
                initial={{ opacity: 0, x: 100 }}
                 animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                    duration: 0.3,
                    ease: 'easeOut',
                    },
                }}
                exit={{
                    opacity: 0,
                    x: 100,
                    transition: {
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: !isMobile ? 0.15 : 0,
                    },
                }}
            >
                
                <PopupHeader/>
                <PopupBody>{children}</PopupBody>
                
            </motion.div>

            
            

            <AnimatePresence>
                { closeState == 'confirming' &&(
                    <ConfirmActionPopup
                        onConfirm={confirmClose}
                        onCancel={cancelClose}
                        message={"You have unsaved changes. Close anyway?"}
                    />

                )}

            </AnimatePresence>
        </div>
    );
}
