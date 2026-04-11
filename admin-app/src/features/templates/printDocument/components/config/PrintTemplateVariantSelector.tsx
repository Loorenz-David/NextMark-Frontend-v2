import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'

import type { availableOrientations, availableVariants } from '../../types'

type PrintTemplateVariantSelectorProps = {
  selectedVariant?: availableVariants
  orientation: availableOrientations
  variantOptions: Array<{ label: string; value: availableVariants }>
  orientationOptions: Array<{ label: string; value: availableOrientations }>
  onChangeVariant: (variant: availableVariants | null) => void
  onChangeOrientation: (orientation: availableOrientations | null) => void
}

export const PrintTemplateVariantSelector = ({
  selectedVariant,
  orientation,
  variantOptions,
  orientationOptions,
  onChangeVariant,
  onChangeOrientation,
}: PrintTemplateVariantSelectorProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="flex flex-col gap-2">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Variant</span>
      <OptionPopoverSelect<availableVariants>
        value={selectedVariant || null}
        onChange={onChangeVariant}
        allowEmpty={false}
        options={variantOptions}
      />
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Orientation</span>
      <OptionPopoverSelect<availableOrientations>
        value={orientation}
        onChange={onChangeOrientation}
        allowEmpty={false}
        options={orientationOptions}
      />
    </div>
  </div>
)
