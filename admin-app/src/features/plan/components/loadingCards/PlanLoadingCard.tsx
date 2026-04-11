import { LoadingCardBase } from "@/shared/loadingCards";

export const PlanLoadingCard = () => {
  return (
    <div className="flex cursor-default flex-col gap-6 rounded-2xl border border-[var(--color-border)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <LoadingCardBase className="h-10 w-10 rounded-full" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LoadingCardBase className="h-5 w-36 rounded-full" />
              <LoadingCardBase className="h-5 w-20 rounded-md" />
            </div>
            <LoadingCardBase className="h-3 w-40 rounded-full" />
          </div>
        </div>

        <LoadingCardBase className="h-6 w-16 rounded-md" />
      </div>

      <div className="flex flex-col gap-2 text-xs text-[var(--color-muted)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LoadingCardBase className="h-3 w-3 rounded-full" />
            <LoadingCardBase className="h-3 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingCardBase className="h-3 w-3 rounded-full" />
            <LoadingCardBase className="h-3 w-8 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingCardBase className="h-3 w-3 rounded-full" />
            <LoadingCardBase className="h-3 w-12 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingCardBase className="h-3 w-3 rounded-full" />
            <LoadingCardBase className="h-3 w-10 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LoadingCardBase className="h-3 w-3 rounded-full" />
          <LoadingCardBase className="h-3 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
};
