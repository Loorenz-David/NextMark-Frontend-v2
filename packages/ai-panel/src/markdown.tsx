/**
 * Lightweight zero-dependency markdown → React renderer.
 *
 * Supported syntax:
 *   Block:  # ## ###  headings,  ``` fenced code blocks,
 *           > blockquote,  --- horizontal rule,
 *           - / *  unordered lists,  1. ordered lists,
 *           - [ ] / - [x]  task lists,
 *           GFM tables (| col | col |),  paragraphs
 *   Inline: **bold** / __bold__,  *italic* / _italic_,  ***bold italic***,
 *           ~~strikethrough~~,  `inline code`,  [text](url)
 *
 * Everything is rendered as React elements — no dangerouslySetInnerHTML.
 */
import type { CSSProperties, ReactNode } from 'react'

import type { AiPanelTheme } from './types'

// ─── Local styles ─────────────────────────────────────────────────────────────

function inlineCodeStyle(theme: AiPanelTheme): CSSProperties {
  return {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.82em',
    background: 'rgba(255,255,255,0.08)',
    color: theme.accent,
    padding: '1px 5px',
    borderRadius: 4,
    letterSpacing: 0,
  }
}

function codeBlockStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'rgba(0,0,0,0.26)',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    lineHeight: 1.5,
    overflowX: 'auto',
    whiteSpace: 'pre',
  }
}

function tableWrapperStyle(): CSSProperties {
  return {
    overflowX: 'auto',
    borderRadius: 12,
  }
}

function tableStyle(theme: AiPanelTheme): CSSProperties {
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    lineHeight: 1.5,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    overflow: 'hidden',
  }
}

function thStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: '8px 12px',
    background: theme.surfaceAlt,
    color: theme.muted,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: `1px solid ${theme.border}`,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(theme: AiPanelTheme, rowIndex: number): CSSProperties {
  return {
    padding: '7px 12px',
    color: theme.text,
    borderBottom: `1px solid ${theme.border}`,
    background: rowIndex % 2 === 1 ? 'rgba(255,255,255,0.03)' : 'transparent',
    verticalAlign: 'top',
  }
}

function blockquoteStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    paddingLeft: 14,
    borderLeft: `3px solid ${theme.accent}`,
    color: theme.muted,
    fontStyle: 'italic',
  }
}

function hrStyle(theme: AiPanelTheme): CSSProperties {
  return {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: 0,
  }
}

function headingStyle(level: 1 | 2 | 3 | 4 | 5 | 6): CSSProperties {
  const fontSizes: Record<number, number> = { 1: 20, 2: 17, 3: 15, 4: 13, 5: 12, 6: 11 }
  return {
    fontWeight: 700,
    fontSize: fontSizes[level],
    lineHeight: 1.3,
    margin: 0,
    letterSpacing: '-0.01em',
  }
}

// ─── Inline parser ─────────────────────────────────────────────────────────────
// Group priority (left to right in alternation):
//   1. ***bold italic***
//   2. **bold** / __bold__
//   3. ~~strikethrough~~
//   4. `inline code`
//   5. *italic* / _italic_
//   6. [text](url)

function parseInline(text: string, theme: AiPanelTheme): ReactNode[] {
  const nodes: ReactNode[] = []
  // Capture group map:
  //  1,2      ***bold italic***
  //  3,4,5    **bold** / __bold__
  //  6,7      ~~strikethrough~~
  //  8,9      `inline code`
  //  10,11,12 *italic* / _italic_
  //  13,14,15 [text](url)
  const regex =
    /(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*|__(.+?)__)|(~~(.+?)~~)|(`(.+?)`)|(\*(.+?)\*|_(.+?)_)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1] !== undefined) {
      // ***bold italic***
      nodes.push(
        <strong key={match.index} style={{ fontWeight: 700, fontStyle: 'italic' }}>
          {match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined) {
      // **bold** or __bold__
      nodes.push(
        <strong key={match.index} style={{ fontWeight: 700 }}>
          {match[4] ?? match[5]}
        </strong>,
      )
    } else if (match[6] !== undefined) {
      // ~~strikethrough~~
      nodes.push(
        <s key={match.index} style={{ opacity: 0.6 }}>
          {match[7]}
        </s>,
      )
    } else if (match[8] !== undefined) {
      // `inline code`
      nodes.push(
        <code key={match.index} style={inlineCodeStyle(theme)}>
          {match[9]}
        </code>,
      )
    } else if (match[10] !== undefined) {
      // *italic* or _italic_
      nodes.push(
        <em key={match.index} style={{ fontStyle: 'italic' }}>
          {match[11] ?? match[12]}
        </em>,
      )
    } else if (match[13] !== undefined) {
      // [text](url)
      nodes.push(
        <a
          key={match.index}
          href={match[15]}
          rel="noopener noreferrer"
          style={{ color: theme.accent, textDecoration: 'underline', textUnderlineOffset: 3 }}
          target="_blank"
        >
          {match[14]}
        </a>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

// ─── Block parser ─────────────────────────────────────────────────────────────

type MdBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'code_block'; code: string }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'task_list'; items: Array<{ checked: boolean; text: string }> }
  | { type: 'table'; headers: string[]; rows: string[][] }

function isTableRow(line: string): boolean {
  return line.trimStart().startsWith('|') && line.trimEnd().endsWith('|')
}

function parseCells(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isSeparatorRow(line: string): boolean {
  return isTableRow(line) && parseCells(line).every((cell) => /^:?-+:?$/.test(cell))
}

function parseBlocks(text: string): MdBlock[] {
  const lines = text.split('\n')
  const blocks: MdBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Horizontal rule: --- / *** / ___
    if (/^(---+|\*\*\*+|___+)\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Blockquote: > text
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'blockquote', lines: quoteLines })
      continue
    }

    // Fenced code block: ```[lang]
    if (/^```/.test(line.trimStart())) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i].trimStart())) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code_block', code: codeLines.join('\n') })
      continue
    }

    // Heading: # through ######
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: headingMatch[2],
      })
      i++
      continue
    }

    // GFM table: | header | header |
    //             | ------ | ------ |
    //             | cell   | cell   |
    if (isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headers = parseCells(line)
      i += 2 // skip header + separator
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseCells(lines[i]))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // Task list: - [ ] text  or  - [x] text
    if (/^[-*]\s\[[ x]\]\s/i.test(line)) {
      const items: Array<{ checked: boolean; text: string }> = []
      while (i < lines.length && /^[-*]\s\[[ x]\]\s/i.test(lines[i])) {
        const checked = /^[-*]\s\[x\]\s/i.test(lines[i])
        const text = lines[i].replace(/^[-*]\s\[[ x]\]\s*/i, '')
        items.push({ checked, text })
        i++
      }
      blocks.push({ type: 'task_list', items })
      continue
    }

    // Unordered list: - item or * item
    if (/^[-*]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // Ordered list: 1. item
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // Empty line — visual separator, skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph — collect consecutive non-special lines.
    // Single newlines within a paragraph are collapsed to a space (standard markdown).
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i].trimStart()) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(---+|\*\*\*+|___+)\s*$/.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !isTableRow(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') })
    }
  }

  return blocks
}

// ─── Public renderer ──────────────────────────────────────────────────────────

export function renderMarkdown(text: string, theme: AiPanelTheme): ReactNode {
  if (!text) return null

  const blocks = parseBlocks(text)

  return (
    <div
      style={{
        color: theme.text,
        fontSize: 17,
        lineHeight: 1.72,
        letterSpacing: '-0.01em',
        display: 'grid',
        gap: 10,
      }}
    >
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'heading': {
            const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)[block.level - 1]
            return (
              <Tag key={blockIndex} style={headingStyle(block.level)}>
                {parseInline(block.text, theme)}
              </Tag>
            )
          }

          case 'code_block':
            return (
              <pre key={blockIndex} style={codeBlockStyle(theme)}>
                <code>{block.code}</code>
              </pre>
            )

          case 'hr':
            return <hr key={blockIndex} style={hrStyle(theme)} />

          case 'blockquote':
            return (
              <blockquote key={blockIndex} style={blockquoteStyle(theme)}>
                {block.lines.map((line, lineIndex) => (
                  <p key={lineIndex} style={{ margin: 0 }}>
                    {parseInline(line, theme)}
                  </p>
                ))}
              </blockquote>
            )

          case 'task_list':
            return (
              <ul key={blockIndex} style={{ paddingLeft: 4, margin: 0, listStyle: 'none' }}>
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: itemIndex < block.items.length - 1 ? 4 : 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        border: `1.5px solid ${item.checked ? theme.accent : theme.muted}`,
                        background: item.checked ? theme.accent : 'transparent',
                        flexShrink: 0,
                        fontSize: 10,
                        color: '#132118',
                        lineHeight: 1,
                      }}
                    >
                      {item.checked ? '✓' : ''}
                    </span>
                    <span style={{ opacity: item.checked ? 0.55 : 1, textDecoration: item.checked ? 'line-through' : 'none' }}>
                      {parseInline(item.text, theme)}
                    </span>
                  </li>
                ))}
              </ul>
            )

          case 'ul':
            return (
              <ul key={blockIndex} style={{ paddingLeft: 22, margin: 0, listStyleType: 'disc' }}>
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    style={{ marginBottom: itemIndex < block.items.length - 1 ? 4 : 0 }}
                  >
                    {parseInline(item, theme)}
                  </li>
                ))}
              </ul>
            )

          case 'ol':
            return (
              <ol key={blockIndex} style={{ paddingLeft: 22, margin: 0, listStyleType: 'decimal' }}>
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    style={{ marginBottom: itemIndex < block.items.length - 1 ? 4 : 0 }}
                  >
                    {parseInline(item, theme)}
                  </li>
                ))}
              </ol>
            )

          case 'table':
            return (
              <div key={blockIndex} style={tableWrapperStyle()}>
                <table style={tableStyle(theme)}>
                  <thead>
                    <tr>
                      {block.headers.map((header, colIndex) => (
                        <th key={colIndex} style={thStyle(theme)}>
                          {parseInline(header, theme)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {block.headers.map((_, colIndex) => (
                          <td key={colIndex} style={tdStyle(theme, rowIndex)}>
                            {parseInline(row[colIndex] ?? '', theme)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          default:
            return (
              <p key={blockIndex} style={{ margin: 0 }}>
                {parseInline(block.text, theme)}
              </p>
            )
        }
      })}
    </div>
  )
}
