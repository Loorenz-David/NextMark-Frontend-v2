import { BasicButton } from "@/shared/buttons/BasicButton";
import type { LabelDefinition } from "@/shared/inputs/LabelPicker/labelTypes";

type EmailLabelsPanelProps = {
  labels: LabelDefinition[];
  activeRegion: "header" | "body" | null;
  onSelect: (label: LabelDefinition) => void;
};

export const EmailLabelsPanel = ({
  labels,
  activeRegion,
  onSelect,
}: EmailLabelsPanelProps) => {
  const resolvedRegion = activeRegion ?? "body";

  return (
    <aside className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="mt-4 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Labels
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          Insert dynamic values
        </h3>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Focus the email header or body on the left, then use these
          placeholders to personalize the template.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {labels.map((label) => (
          <BasicButton
            key={label.id}
            params={{
              variant: "secondary",
              onClick: () => onSelect(label),
              className: "px-3 py-1.5 text-xs",
              ariaLabel: `Insert ${label.displayName}`,
            }}
          >
            {label.displayName}
          </BasicButton>
        ))}
      </div>
    </aside>
  );
};
