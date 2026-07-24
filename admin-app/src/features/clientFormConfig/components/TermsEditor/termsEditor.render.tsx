import type { RenderElementProps, RenderLeafProps } from 'slate-react'

const readBlockType = (element: RenderElementProps['element']): string =>
  'type' in element && typeof element.type === 'string' ? element.type : 'paragraph'

export const renderTermsElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (readBlockType(element)) {
    case 'heading':
      return (
        <h3 {...attributes} className="mb-1 mt-3 text-base font-semibold text-[var(--color-text)]">
          {children}
        </h3>
      )
    case 'bullet':
      return (
        <li {...attributes} className="ml-5 list-disc py-0.5">
          {children}
        </li>
      )
    default:
      return (
        <p {...attributes} className="min-h-[1.2rem] py-0.5">
          {children}
        </p>
      )
  }
}

export const renderTermsLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const marks = leaf as unknown as { bold?: boolean; italic?: boolean }
  let content = children

  if (marks.bold) {
    content = <strong>{content}</strong>
  }
  if (marks.italic) {
    content = <em>{content}</em>
  }

  return <span {...attributes}>{content}</span>
}
