import { LoadingCardBase } from "..";

export const OrderTimeLoadingPill = () => {
  return (
    <div
      className="flex min-w-[72px] items-center justify-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1"
      aria-label="Loading expected arrival time"
      aria-busy="true"
    >
      <LoadingCardBase className="h-4 w-4 rounded-full" />
      <LoadingCardBase className="h-4 w-10 rounded-full" />
    </div>
  );
};
