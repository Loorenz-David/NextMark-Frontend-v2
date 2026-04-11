import { useMemo, useState } from "react";

import type { Descendant } from "slate";
import { createEditor } from "slate";
import type { RenderElementProps } from "slate-react";
import { ReactEditor, withReact } from "slate-react";

import type { LabelDefinition } from "@/shared/inputs/LabelPicker/labelTypes";
import type { TemplateLabelElement } from "@/shared/inputs/TemplateEditor/renderElement";
import {
  insertLabel,
  withLabels,
} from "@/shared/inputs/TemplateEditor/withLabels";

import { allowedLabels } from "../config/emailLabelConfig";
import type {
  EmailFooterButton,
  EmailTemplateValue,
} from "../types/emailTemplate";
import { EmailLabelsPanel } from "./EmailLabelsPanel";
import { EmailPrimaryCtaEditor } from "./EmailPrimaryCtaEditor";
import { EmailTemplatePreviewCanvas } from "./EmailTemplatePreviewCanvas";

type EmailTemplateEditorProps = {
  value: EmailTemplateValue;
  onChange: (value: EmailTemplateValue) => void;
};

const buildFooterButtonId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `footer-btn-${Date.now()}`;

const getPrimaryFooterButton = (buttons: EmailFooterButton[]) =>
  buttons[0] ?? null;

const updatePrimaryFooterButton = (
  buttons: EmailFooterButton[],
  patch: Partial<EmailFooterButton>,
): EmailFooterButton[] => {
  if (buttons.length === 0) {
    return [
      {
        id: buildFooterButtonId(),
        label: "",
        urlTemplate: "",
        ...patch,
      },
    ];
  }

  const [primaryButton, ...rest] = buttons;

  return [{ ...primaryButton, ...patch }, ...rest];
};

const isLabelElement = (
  element: RenderElementProps["element"],
): element is TemplateLabelElement =>
  "type" in element && element.type === "label";

const createEmailRenderElement =
  (labelLookup: Record<string, string>) =>
  ({ attributes, children, element }: RenderElementProps) => {
    if (isLabelElement(element)) {
      const labelText = labelLookup[element.labelKey] ?? element.labelKey;
      return (
        <span
          {...attributes}
          contentEditable={false}
          className="inline-flex items-center rounded-xl border border-[#8fe3de]/42 bg-[#8fe3de]/18 px-2.5 py-0.5 text-xs font-semibold text-[#78d8d2]"
        >
          {labelText}
          {children}
        </span>
      );
    }

    return (
      <p {...attributes} className="min-h-[1.2rem]">
        {children}
      </p>
    );
  };

export const EmailTemplateEditor = ({
  value,
  onChange,
}: EmailTemplateEditorProps) => {
  const [activeRegion, setActiveRegion] = useState<"header" | "body" | null>(
    null,
  );

  const headerEditor = useMemo(() => withLabels(withReact(createEditor())), []);
  const bodyEditor = useMemo(() => withLabels(withReact(createEditor())), []);
  const labelLookup = useMemo(
    () =>
      Object.fromEntries(
        allowedLabels.map((label) => [label.id, label.displayName]),
      ),
    [],
  );
  const renderElement = useMemo(
    () => createEmailRenderElement(labelLookup),
    [labelLookup],
  );

  const primaryButton = getPrimaryFooterButton(value.footerButtons);

  const handleLabelSelect = (label: LabelDefinition) => {
    const targetEditor = activeRegion === "header" ? headerEditor : bodyEditor;

    ReactEditor.focus(targetEditor);
    insertLabel(targetEditor, label.id);

    if (!activeRegion) {
      setActiveRegion("body");
    }
  };

  const updateFooterButton = (patch: Partial<EmailFooterButton>) => {
    onChange({
      ...value,
      footerButtons: updatePrimaryFooterButton(value.footerButtons, patch),
    });
  };

  return (
    <section className="admin-glass-panel-strong rounded-[28px] p-6 shadow-none">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Email content
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          Compose directly inside the live preview. Focus the header or body,
          then use labels and the CTA panel to build a responsive email that
          reads well on both mobile and desktop.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <EmailTemplatePreviewCanvas
          headerEditor={headerEditor}
          headerValue={value.header}
          onHeaderChange={(header: Descendant[]) =>
            onChange({ ...value, header })
          }
          bodyEditor={bodyEditor}
          bodyValue={value.body}
          onBodyChange={(body: Descendant[]) => onChange({ ...value, body })}
          renderElement={renderElement}
          activeRegion={activeRegion}
          onHeaderFocus={() => setActiveRegion("header")}
          onBodyFocus={() => setActiveRegion("body")}
          primaryButtonLabel={primaryButton?.label ?? ""}
        />

        <div className="flex flex-col gap-5">
          <EmailLabelsPanel
            labels={allowedLabels}
            activeRegion={activeRegion}
            onSelect={handleLabelSelect}
          />

          <EmailPrimaryCtaEditor
            label={primaryButton?.label ?? ""}
            urlTemplate={primaryButton?.urlTemplate ?? ""}
            onLabelChange={(label) => updateFooterButton({ label })}
            onUrlChange={(urlTemplate) => updateFooterButton({ urlTemplate })}
          />
        </div>
      </div>
    </section>
  );
};
