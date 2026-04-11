import { CurrentLocationIconSrc } from "@/assets/icons";
import { LoadingCardBase } from "@/shared/loadingCards";

export const DeliveryAddressLoadingField = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 rounded-[1.45rem] border border-white/10 bg-white/[0.08] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_30%,transparent_72%,rgba(0,0,0,0.04))]" />

      <div className="relative flex min-h-[58px] items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
          <img
            alt="Current location"
            className="h-4 w-4 opacity-80"
            src={CurrentLocationIconSrc}
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <LoadingCardBase className="h-3 w-28 rounded-full" />
          <LoadingCardBase className="h-4 w-[72%] rounded-full" />
        </div>
      </div>
    </div>
  );
};
