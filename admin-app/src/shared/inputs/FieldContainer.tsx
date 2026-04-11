import { InputWarning, type InputWarningState } from "./InputWarning";
import type { InputWarningController } from "./useInputWarning.hook";
import type { ReactNode } from "react";
import { InfoHover } from "@/shared/layout/InfoHover";
import type { InfoHoverMessage } from "@/shared/layout/InfoHover";
import type { Placement } from "@floating-ui/react";

export function Field({
  label,
  children,
  required = false,
  warning,
  warningController,
  gap = 1,
  warningPlacement = "atBottom",
  info,
  infoTriggerVariant,
  infoTriggerText,
  infoTriggerClassName,
  infoOverlayClassName,
  infoIconClassName,
  infoRenderInPortal = true,
  infoPlacement,
  infoOffset,
  infoInteractive,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  warning?: InputWarningState;
  warningController?: InputWarningController;
  gap?: number;
  warningPlacement?: "atBottom" | "besidesLabel";
  info?: string | InfoHoverMessage | InfoHoverMessage[];
  infoTriggerVariant?: "icon" | "text";
  infoTriggerText?: string;
  infoTriggerClassName?: string;
  infoOverlayClassName?: string;
  infoIconClassName?: string;
  infoRenderInPortal?: boolean;
  infoPlacement?: Placement;
  infoOffset?: number;
  infoInteractive?: boolean;
}) {
  const resolvedWarning = warningController?.warning ?? warning;
  const resolvedInfo = typeof info === "string" ? { content: info } : info;
  return (
    <label className={`flex w-full flex-col py-1  ${"gap-" + gap}`}>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[var(--color-muted)]">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
          {resolvedInfo ? (
            <InfoHover
              content={resolvedInfo}
              triggerVariant={infoTriggerVariant}
              triggerText={infoTriggerText}
              triggerClassName={infoTriggerClassName}
              overlayClassName={infoOverlayClassName}
              iconClassName={infoIconClassName}
              renderInPortal={infoRenderInPortal}
              placement={infoPlacement}
              offset={infoOffset}
              interactive={infoInteractive}
            />
          ) : null}
        </div>
        {warningPlacement == "besidesLabel" && (
          <div>{resolvedWarning && <InputWarning {...resolvedWarning} />}</div>
        )}
      </div>
      {children}
      {warningPlacement == "atBottom" && resolvedWarning && (
        <InputWarning {...resolvedWarning} />
      )}
    </label>
  );
}
