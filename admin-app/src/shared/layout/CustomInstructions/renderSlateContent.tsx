import type { ReactNode } from 'react'

import type { SlateBlock, SlateTextNode } from './CustomInstructions.types'

const renderTextNode = (node: SlateTextNode, key: string): ReactNode => {
  let content: ReactNode = node.text

  if (node.underline) {
    content = <span className="underline">{content}</span>
  }

  if (node.bold) {
    content = <strong>{content}</strong>
  }

  if (node.link) {
    return (
      <a
        key={key}
        href={node.link}
        target="_blank"
        rel="noreferrer"
        className="text-[#94f0e7] underline transition-colors hover:text-[#b8fff5]"
      >
        {content}
      </a>
    )
  }

  return <span key={key}>{content}</span>
}

const renderBlock = (block: SlateBlock, key: string): ReactNode => {
  const children = block.children.map((node, index) =>
    renderTextNode(node, `${key}-text-${index}`),
  )

  if (block.type === 'title') {
    return (
      <h4 key={key} className="text-sm font-semibold text-white/95">
        {children}
      </h4>
    )
  }

  return (
    <p key={key} className="text-sm leading-6 text-white/72">
      {children}
    </p>
  )
}

export const renderSlateBlocks = (blocks: SlateBlock[], keyPrefix: string): ReactNode[] =>
  blocks.map((block, index) => renderBlock(block, `${keyPrefix}-block-${index}`))
