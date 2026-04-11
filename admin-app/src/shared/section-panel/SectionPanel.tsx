import { useState } from "react";
import { SectionPanelContext } from "./SectionPanelContext";
import { BasicButton } from "@/shared/buttons/BasicButton";
import type { SectionHeaderConfig } from "./SectionPanelContext";

type SectionPanelProps = {
  children: React.ReactNode;
  onRequestClose?: () => void;
  parentParams?: { borderLeft?: string; pageClass?: string };
  style?: React.CSSProperties;
};

export const SectionPanel = ({
  children,
  parentParams,
  style,
  onRequestClose,
}: SectionPanelProps) => {
  const [header, setHeader] = useState<null | SectionHeaderConfig>(null);

  const onClose = () => {
    onRequestClose?.();
  };

  return (
    <SectionPanelContext.Provider value={{ setHeader, onClose }}>
      <section
        className="admin-glass-panel-strong flex h-full w-full flex-col overflow-hidden rounded-none"
        style={{
          borderLeft: parentParams?.borderLeft
            ? `2px solid ${parentParams.borderLeft}`
            : undefined,
          ...style,
        }}
      >
        {header && (
          <header className="flex w-full flex-col shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            <div
              className={`admin-glass-divider flex items-center justify-between gap-3 border-b px-4 py-3 transition-colors duration-200 ${header.headerButtonsBgClass ?? ""}`}
              style={{
                borderBottomColor: header.headerButtonsBgClass?.includes(
                  "border-b-transparent",
                )
                  ? "transparent"
                  : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                {header.icon && (
                  <div className="inline-flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.06] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    {header.icon}
                  </div>
                )}
                {header.title && (
                  <div className="text-lg font-semibold text-[var(--color-text)]">
                    {header.title}
                  </div>
                )}
              </div>
              {header.closeButton && !header.customHeaderButton && (
                <BasicButton
                  params={{
                    variant: "text",
                    onClick: onClose,
                  }}
                >
                  Close
                </BasicButton>
              )}
              {header.customHeaderButton && header?.customHeaderButton}
            </div>
          </header>
        )}
        <div
          className={`scroll-thin flex min-h-0 flex-1 overflow-hidden ${parentParams?.pageClass ?? ""}`}
        >
          {children}
        </div>
      </section>
    </SectionPanelContext.Provider>
  );
};
