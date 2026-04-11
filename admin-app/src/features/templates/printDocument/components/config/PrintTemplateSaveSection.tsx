import { BasicButton } from '@/shared/buttons/BasicButton'

type PrintTemplateSaveSectionProps = {
  isExisting: boolean
  onSave: () => void
}

export const PrintTemplateSaveSection = ({ isExisting, onSave }: PrintTemplateSaveSectionProps) => (
  <div className="mt-5 flex items-end justify-end gap-6 border-t border-[var(--color-border)]/70 pt-5">
    <BasicButton
      params={{
        variant: 'primary',
        className: 'py-2 px-3',
        onClick: onSave,
        ariaLabel: isExisting ? 'Save template' : 'Create template',
      }}
    >
      {isExisting ? 'Save' : 'Create'}
    </BasicButton>
  </div>
)
