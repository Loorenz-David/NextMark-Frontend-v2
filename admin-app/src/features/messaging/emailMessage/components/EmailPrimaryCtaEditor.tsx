import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { Cell, SplitRow } from "@/shared/layout/cells";

import { EmailCtaUrlField } from "./EmailCtaUrlField";

type EmailPrimaryCtaEditorProps = {
  label: string;
  urlTemplate: string;
  onLabelChange: (value: string) => void;
  onUrlChange: (value: string) => void;
};

export const EmailPrimaryCtaEditor = ({
  label,
  urlTemplate,
  onLabelChange,
  onUrlChange,
}: EmailPrimaryCtaEditorProps) => {
  return (
    <section className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="mb-4 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Primary CTA
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          Footer action button
        </h3>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Configure the main action shown at the bottom of the email. Extra
          legacy footer buttons remain preserved but are not edited here.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <Cell>
          <Field label="Button label:">
            <InputField
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              placeholder="Track order"
              fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
              inputClassName={PLAIN_INPUT_CLASS}
            />
          </Field>
        </Cell>

        <SplitRow splitRowClass="grid grid-cols-1">
          <Cell>
            <Field label="Button URL template:">
              <EmailCtaUrlField value={urlTemplate} onChange={onUrlChange} />
            </Field>
          </Cell>
        </SplitRow>
      </div>
    </section>
  );
};
