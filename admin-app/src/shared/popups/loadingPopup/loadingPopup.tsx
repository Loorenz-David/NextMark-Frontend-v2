import { motion, AnimatePresence } from 'framer-motion'
import { useMobile } from "@/app/contexts/MobileContext";
import { useState } from 'react';



type PropsPopupRoot = {
  children: React.ReactNode
  isOpen: boolean
}

export const LoadingPopup = ({
    children,
    isOpen,
}: PropsPopupRoot) => {
    const {isMobile} = useMobile()


    if(!isOpen) return null
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
                />
            }
            <motion.div
                className={` z-10 pointer-events-auto `}
                initial={{ opacity: 0, y: 100 }}
                    animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                    duration: 0.3,
                    ease: 'easeOut',
                    },
                }}
                exit={{
                    opacity: 0,
                    y: 100,
                    transition: {
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: !isMobile ? 0.15 : 0,
                    },
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}