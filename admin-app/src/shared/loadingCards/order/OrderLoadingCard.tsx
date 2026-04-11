import { LoadingCardBase } from "..";
import { OrderTimeLoadingPill } from "./OrderTimeLoadingPill";

type OrderLoadingCardVariant = "orderMain" | "routeGroup";

type OrderLoadingCardProps = {
  variant?: OrderLoadingCardVariant;
};

const RouteGroupOrderLoadingCard = () => {
  return (
    <div className="admin-glass-panel admin-surface-compact relative flex flex-col gap-2.5 overflow-hidden rounded-lg border border-white/10 p-4 pl-2">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_26%,transparent_72%,rgba(0,0,0,0.04))]" />

      <div className="relative z-10 flex w-full gap-3">
        <LoadingCardBase className="h-9 w-9 shrink-0 rounded-full" />

        <div className="flex min-w-0 flex-1 flex-col gap-2 pl-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <LoadingCardBase className="h-5 w-18 rounded-full" />
              <LoadingCardBase className="h-4 w-10 rounded-full" />
            </div>
            <LoadingCardBase className="h-6 w-14 rounded-md" />
          </div>

          <div className="flex w-full items-center justify-between gap-3">
            <LoadingCardBase className="h-3 w-32 rounded-full" />
            <div className="flex items-center justify-end gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
                <LoadingCardBase className="h-3 w-3 rounded-full" />
                <LoadingCardBase className="h-3 w-4 rounded-full" />
              </div>
              <OrderTimeLoadingPill />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderMainLoadingCard = () => {
  return (
    <div className="admin-glass-panel admin-surface-compact relative flex flex-col gap-2.5 overflow-hidden rounded-lg border border-white/10 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <LoadingCardBase className="h-5 w-18 rounded-full" />
            <LoadingCardBase className="h-4 w-12 rounded-full" />
          </div>
          <LoadingCardBase className="h-4 w-14 rounded-full" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <LoadingCardBase className="h-7 w-7 rounded-lg" />
          <LoadingCardBase className="h-6 w-16 rounded-md" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <LoadingCardBase className="h-3 w-36 rounded-full" />
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1">
          <LoadingCardBase className="h-3 w-3 rounded-full" />
          <LoadingCardBase className="h-3 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const OrderLoadingCard = ({
  variant = "orderMain",
}: OrderLoadingCardProps) => {
  return variant === "routeGroup" ? (
    <RouteGroupOrderLoadingCard />
  ) : (
    <OrderMainLoadingCard />
  );
};
