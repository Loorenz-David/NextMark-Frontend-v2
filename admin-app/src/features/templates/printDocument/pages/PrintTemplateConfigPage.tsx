import { AnimatePresence, motion } from 'framer-motion'
import {
  PrintTemplateConfigHeader,
  PrintTemplatePreview,
  PrintTemplateSaveSection,
  PrintTemplateVariantSelector,
} from '../components/config'
import { usePrintTemplateConfigPageFlow } from '../flows/printTemplateConfigPage.flow'

export const PrintTemplateConfigPage = () => {
  const { viewModel } = usePrintTemplateConfigPageFlow()

  if (!viewModel) {
    return (
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5 text-sm text-[var(--color-muted)]">
        Invalid channel/event path.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${viewModel.parsedParams.channel}-${viewModel.parsedParams.event}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="admin-glass-panel-strong rounded-[28px] p-5 shadow-none"
      >
        <PrintTemplateConfigHeader
          enabled={viewModel.formState.enable}
          askPermission={viewModel.formState.ask_permission}
          onBack={viewModel.printTemplateActions.closeTemplatePage}
          onTogglePermission={viewModel.printTemplateForm.togglePermission}
          onToggleEnable={viewModel.printTemplateForm.toggleEnable}
        />
        <PrintTemplateVariantSelector
          selectedVariant={viewModel.selectedVariant}
          orientation={viewModel.formState.orientation}
          variantOptions={viewModel.variantOptions}
          orientationOptions={viewModel.orientationOptions}
          onChangeVariant={(variant) => {
            if (!variant) return
            viewModel.printTemplateForm.changeVariant(variant)
          }}
          onChangeOrientation={(orientation) => {
            if (!orientation) return
            viewModel.printTemplateForm.changeOrientation(orientation)
          }}
        />
        <PrintTemplatePreview
          orientation={viewModel.formState.orientation}
          selectedVariantDefinition={viewModel.selectedVariantDefinition}
        />
        <PrintTemplateSaveSection
          isExisting={viewModel.isExisting}
          onSave={() => {
            void viewModel.printTemplateActions.saveChangedTemplate(viewModel.formState, {
              isExisting: viewModel.isExisting,
              existingTemplate: viewModel.existingTemplate,
            })
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
