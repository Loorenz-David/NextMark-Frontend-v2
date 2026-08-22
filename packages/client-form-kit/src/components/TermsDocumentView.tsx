import { Fragment } from "react";
import {
  groupTermsBlocks,
  isBlankTermsBlock,
  type TermsBlock,
  type TermsDocument,
  type TermsSpan,
} from "@shared-domain";

/**
 * Read-only renderer for a published terms document.
 *
 * A block carries one span per formatting run — Slate splits a line every time a
 * mark changes — so spans render inline, in order, inside their block. Unknown
 * block types are normalized to paragraphs upstream, so a block type added later
 * degrades to readable text instead of disappearing.
 */

const renderSpan = (span: TermsSpan, index: number) => {
  if (!span.text) {
    return null;
  }

  let content = <>{span.text}</>;
  if (span.italic) {
    content = <em>{content}</em>;
  }
  if (span.bold) {
    content = <strong className="font-semibold text-[var(--ink)]">{content}</strong>;
  }

  return <Fragment key={index}>{content}</Fragment>;
};

const renderSpans = (block: TermsBlock) => block.spans.map(renderSpan);

export const TermsDocumentView = ({ document }: { document: TermsDocument }) => {
  const nodes = groupTermsBlocks(document);

  return (
    // `whitespace-pre-wrap` keeps runs of spaces the author typed; without it the
    // rendered text quietly differs from what was accepted.
    <div className="space-y-3 whitespace-pre-wrap text-[length:var(--cf-body)] leading-relaxed text-[var(--ink-soft)]">
      {nodes.map((node, nodeIndex) => {
        if (node.kind === "list") {
          return (
            <ul key={nodeIndex} className="list-disc space-y-1 pl-5 marker:text-[var(--ink-faint)]">
              {node.blocks.map((block, blockIndex) => (
                <li key={blockIndex}>{renderSpans(block)}</li>
              ))}
            </ul>
          );
        }

        const { block } = node;

        if (block.type === "heading") {
          return (
            <h3
              key={nodeIndex}
              className="pt-2 text-[length:var(--cf-input)] font-semibold text-[var(--ink)] first:pt-0"
            >
              {renderSpans(block)}
            </h3>
          );
        }

        // A blank paragraph is a deliberate spacer, not content to drop.
        if (isBlankTermsBlock(block)) {
          return <div key={nodeIndex} aria-hidden="true" className="h-2" />;
        }

        return <p key={nodeIndex}>{renderSpans(block)}</p>;
      })}
    </div>
  );
};
