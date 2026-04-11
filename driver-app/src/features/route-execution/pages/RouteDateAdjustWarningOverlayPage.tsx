import { useState } from "react";
import { TriangleWarningIcon } from "@/assets/icons";

type RouteDateAdjustWarningOverlayPageProps = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<boolean>;
  onClose: () => void;
};

export function RouteDateAdjustWarningOverlayPage({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: RouteDateAdjustWarningOverlayPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-full items-center p-4 text-white sm:items-center sm:justify-center">
      <div className="w-full max-w-[28rem] rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(93,108,107,0.96),rgba(74,87,86,0.96))] p-5 shadow-[0_32px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,120,87,0.14)] text-[rgb(255,120,87)]">
          <TriangleWarningIcon className="h-6 w-6" />
        </div>

        <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,214,122,0.72)]">
          Route Schedule Warning
        </div>
        <h2 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-white/72">{message}</p>

        <div className="mt-7 grid grid-cols-[1fr_1.45fr] gap-3">
          <button
            className="rounded-[24px] border border-white/14 bg-white/[0.06] px-5 py-4 text-base font-semibold text-white/88 transition hover:bg-white/[0.1]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-[24px] bg-[linear-gradient(135deg,rgb(45,133,118),rgb(32,115,99))] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_36px_rgba(20,84,73,0.32)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => {
              void handleConfirm();
            }}
            type="button"
          >
            {isSubmitting ? "Adjusting…" : confirmLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
