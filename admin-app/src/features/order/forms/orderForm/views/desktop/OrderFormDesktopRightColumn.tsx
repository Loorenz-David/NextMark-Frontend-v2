import { motion } from 'framer-motion'

import type { OrderFormLayoutModel } from '../../OrderForm.layout.model'
import { OrderFormCostumerPanel } from '../../components/CostumerPanel'
import { OrderFormItemsPanel } from '../../components/OrderFormItemsPanel'
import type { DesktopLayoutMode } from './OrderFormDesktop.layout'

type OrderFormDesktopRightColumnProps = {
  model: OrderFormLayoutModel
  layoutMode: DesktopLayoutMode
  setLayoutMode: (value:DesktopLayoutMode) => void
}

export const OrderFormDesktopRightColumn = ({ 
  model ,
  layoutMode,
  setLayoutMode
}: OrderFormDesktopRightColumnProps) => {
  const isCustomerExpanded = layoutMode === 'customer-expanded'

  return (
    <motion.div
      layout
      className={`relative flex min-h-0 flex-1 flex-col gap-4 items-stretch ${
        isCustomerExpanded ? 'justify-start' : 'justify-center'
      }`}
    >
      <div
        className={`min-h-0 w-full self-center overflow-hidden transition-[max-width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCustomerExpanded ? 'h-full max-w-[600px]' : 'h-auto max-h-[350px] max-w-[350px]'
        }`}
      >
        <div className="h-full min-h-0">
          <OrderFormCostumerPanel
            setLayoutMode={setLayoutMode}
              layoutMode={layoutMode}
              costumer={model.selectedCostumer}
              onSelectCostumer={(costumer, source = 'panel') =>
                model.requestSelectCostumer(costumer, source)
              }
          />
        </div>
      </div>

      <motion.div
        className={`min-h-0 w-full overflow-hidden ${isCustomerExpanded ? 'max-h-0' : 'flex-1'} max-w-[350px] self-center`}
        layout
        style={{
          width: '350px',
          pointerEvents: isCustomerExpanded ? 'none' : 'auto',
        }}
        animate={{
          opacity: isCustomerExpanded ? 0 : 1,
          x: isCustomerExpanded ? 80 : 0,
        }}
        transition={{
          opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          x: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <OrderFormItemsPanel
          model={model}
        />
      </motion.div>
    </motion.div>
  )
}
