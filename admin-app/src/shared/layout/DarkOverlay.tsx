import { motion } from 'framer-motion'

type Props = {
    onTapAction?: ()=>void
}

export const DarkOverlay = ({
    onTapAction
}:Props) => {
    return ( 
         <motion.div
                    className="absolute inset-0 popup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onTapAction}
                />
     );
}
 
