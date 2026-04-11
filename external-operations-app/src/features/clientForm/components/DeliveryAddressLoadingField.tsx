const shimmerClassName =
  "overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[client-form-shimmer_1.25s_ease-in-out_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]";

const LoadingValue = ({ className }: { className: string }) => {
  return <div className={`${className} `} aria-hidden="true" />;
};

export const DeliveryAddressLoadingField = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
            City
          </span>
          <div
            className={`relative rounded-xl border border-white/10 bg-white/6 px-3 py-2 ${shimmerClassName}`}
          >
            <LoadingValue className="h-4 w-24" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
            Postal code
          </span>
          <div
            className={`relative rounded-xl border border-white/10 bg-white/6 px-3 py-2 ${shimmerClassName}`}
          >
            <LoadingValue className="h-4 w-20" />
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">
            Country
          </span>
          <div
            className={`relative rounded-xl border border-white/10 bg-white/6 px-3 py-2 ${shimmerClassName}`}
          >
            <LoadingValue className="h-4 w-32" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes client-form-shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </>
  );
};
