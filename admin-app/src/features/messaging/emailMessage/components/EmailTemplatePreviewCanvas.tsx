import type { FocusEvent, JSX } from "react";

import type { BaseEditor, Descendant } from "slate";
import type { ReactEditor, RenderElementProps } from "slate-react";

import { EmailEditableRegion } from "./EmailEditableRegion";
import { EmailSubjectEditor } from "./EmailSubjectEditor";

type EmailTemplatePreviewCanvasProps = {
  subjectEditor: BaseEditor & ReactEditor;
  subject: Descendant[];
  onSubjectChange: (value: Descendant[]) => void;
  bodyEditor: BaseEditor & ReactEditor;
  bodyValue: Descendant[];
  onBodyChange: (value: Descendant[]) => void;
  renderElement: (props: RenderElementProps) => JSX.Element;
  activeRegion?: "subject" | "body" | null;
  onSubjectFocus: () => void;
  onBodyFocus: (event: FocusEvent<HTMLDivElement>) => void;
  primaryButtonLabel: string;
};

export const EmailTemplatePreviewCanvas = ({
  subjectEditor,
  subject,
  onSubjectChange,
  bodyEditor,
  bodyValue,
  onBodyChange,
  renderElement,
  activeRegion,
  onSubjectFocus,
  onBodyFocus,
  primaryButtonLabel,
}: EmailTemplatePreviewCanvasProps) => {
  return (
    <section className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Email canvas
          </h3>
        </div>
      </div>

      <div className="mx-auto ">
        <div className=" ">
          <div className="border-b border-black/[0.08] px-4 py-4 md:px-5">
            <EmailSubjectEditor
              editor={subjectEditor}
              value={subject}
              onChange={onSubjectChange}
              renderElement={renderElement}
              onFocus={onSubjectFocus}
            />
          </div>

          <EmailEditableRegion
            sectionLabel="Message"
            editor={bodyEditor}
            value={bodyValue}
            onChange={onBodyChange}
            renderElement={renderElement}
            placeholder="Start with the email headline, then press Enter to continue with body text..."
            onFocus={onBodyFocus}
            isActive={activeRegion === "body"}
            helperText="The first paragraph is styled as the email headline. New paragraphs use normal body text."
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
