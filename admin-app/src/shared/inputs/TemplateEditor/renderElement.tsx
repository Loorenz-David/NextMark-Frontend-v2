import type { RenderElementProps } from 'slate-react'

export type TemplateLabelElement = {
  type: 'label'
  labelKey: string
  children: { text: '' }[]
}

type LabelLookup = Record<string, string>

const isLabelElement = (element: RenderElementProps['element']): element is TemplateLabelElement =>
  'type' in element && element.type === 'label'

export const createRenderElement = (labelLookup: LabelLookup) =>
  ({ attributes, children, element }: RenderElementProps) => {
    if (isLabelElement(element)) {
      const labelText = labelLookup[element.labelKey] ?? element.labelKey
      return (
        <span
          {...attributes}
          contentEditable={false}
          className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-text)]"
        >
          {labelText}
          {children}
        </span>
      )
    }

    return <p {...attributes} className="min-h-[1.2rem]">{children}</p>
  }
