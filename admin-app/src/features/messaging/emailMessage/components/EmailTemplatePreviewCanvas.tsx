import type { FocusEvent, JSX } from "react";

import type { BaseEditor, Descendant } from "slate";
import type { ReactEditor, RenderElementProps } from "slate-react";

import { EmailEditableRegion } from "./EmailEditableRegion";

type EmailTemplatePreviewCanvasProps = {
  headerEditor: BaseEditor & ReactEditor;
  headerValue: Descendant[];
  onHeaderChange: (value: Descendant[]) => void;
  bodyEditor: BaseEditor & ReactEditor;
  bodyValue: Descendant[];
  onBodyChange: (value: Descendant[]) => void;
  renderElement: (props: RenderElementProps) => JSX.Element;
  activeRegion?: "header" | "body" | null;
  onHeaderFocus: (event: FocusEvent<HTMLDivElement>) => void;
  onBodyFocus: (event: FocusEvent<HTMLDivElement>) => void;
  primaryButtonLabel: string;
};

export const EmailTemplatePreviewCanvas = ({
  headerEditor,
  headerValue,
  onHeaderChange,
  bodyEditor,
  bodyValue,
  onBodyChange,
  renderElement,
  activeRegion,
  onHeaderFocus,
  onBodyFocus,
  primaryButtonLabel,
}: EmailTemplatePreviewCanvasProps) => {
  return (
    <section className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Live preview
          </p>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Email canvas
          </h3>
        </div>
      </div>

      <div className="mx-auto ">
        <div className=" ">
          <EmailEditableRegion
            sectionLabel="Header"
            editor={headerEditor}
            value={headerValue}
            onChange={onHeaderChange}
            renderElement={renderElement}
            placeholder="Write a short, clear email headline..."
            onFocus={onHeaderFocus}
            isActive={activeRegion === "header"}
            singleLine
          />

          <EmailEditableRegion
            sectionLabel="Body"
            editor={bodyEditor}
            value={bodyValue}
            onChange={onBodyChange}
            renderElement={renderElement}
            placeholder="Write the email body here. Use labels to personalize delivery details, tracking information, and client data..."
            onFocus={onBodyFocus}
            isActive={activeRegion === "body"}
            helperText="Keep paragraphs short so the email stays readable on both desktop and mobile."
          />
        </div>

        <div className="border-t border-[var(--color-muted)] px-6 py-6 md:px-8">
          <div className="flex flex-col items-start gap-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Primary action
            </p>
            <div
              className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                primaryButtonLabel.trim().length > 0
                  ? "border-[#67cfc9]/46 bg-[linear-gradient(135deg,rgba(131,204,185,0.84),rgba(92,195,201,0.72))] text-[#112526] shadow-[0_10px_24px_rgba(92,195,201,0.10)]"
                  : "border-black/[0.08] bg-[var(--color-muted)]/20 text-[var(--color-text)] "
              }`}
            >
              {primaryButtonLabel.trim().length > 0
                ? primaryButtonLabel
                : "Add primary CTA label on the right"}
            </div>
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              The live footer button updates from the CTA settings panel and
              stays visible in the email preview only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
