import type { FocusEvent, JSX, KeyboardEvent } from "react";

import type { BaseEditor, Descendant } from "slate";
import type { ReactEditor, RenderElementProps } from "slate-react";

import { SlateEditor } from "@/shared/inputs/TemplateEditor/SlateEditor";

type EmailEditableRegionProps = {
  sectionLabel: string;
  editor: BaseEditor & ReactEditor;
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  renderElement: (props: RenderElementProps) => JSX.Element;
  placeholder: string;
  onFocus: (event: FocusEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  singleLine?: boolean;
  helperText?: string;
};

export const EmailEditableRegion = ({
  sectionLabel,
  editor,
  value,
  onChange,
  renderElement,
  placeholder,
  onFocus,
  isActive = false,
  singleLine = false,
  helperText,
}: EmailEditableRegionProps) => {
  const sharedEditorClass =
    "w-full !rounded-[18px] !border !border-black/[0.10] !bg-white/[0.05] !px-4 !py-3 !shadow-none transition placeholder:text-[var(--color-muted)]/70 focus:!border-[#67cfc9]/55 focus:!bg-white/[0.05] focus:!shadow-[0_0_0_3px_rgba(103,207,201,0.12)]";
  const regionViewportClass = singleLine
    ? "h-[56px] min-h-[56px] overflow-x-auto overflow-y-hidden"
    : "min-h-[220px]";
  const editorBehaviorClass = singleLine
    ? "!h-[56px] !min-h-[56px] !py-0 overflow-x-auto overflow-y-hidden whitespace-pre text-[1rem] font-bold leading-8 text-[var(--color-text)] flex items-center [&>*]:w-full [&_[data-slate-node='element']]:my-0 [&_[data-slate-node='element']]:whitespace-pre [&_[data-slate-node='element']]:overflow-hidden"
    : "!min-h-[220px] text-[1rem] leading-8 text-[var(--color-text)]";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (singleLine && event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <section
      className={`border-b px-4 py-4 transition last:border-b-0 md:px-5 ${
        isActive
          ? "border-[#67cfc9]/28"
          : "border-black/[0.08]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {sectionLabel}
        </p>
      </div>

      <div className={regionViewportClass}>
        <SlateEditor
          key={JSON.stringify(value)}
          editor={editor}
          value={value}
          onChange={onChange}
          renderElement={renderElement}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          className={`${sharedEditorClass} ${editorBehaviorClass}`}
        />
      </div>

      {helperText ? (
        <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
          {helperText}
        </p>
      ) : null}
    </section>
  );
};
