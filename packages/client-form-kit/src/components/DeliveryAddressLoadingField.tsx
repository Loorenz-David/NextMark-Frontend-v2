const shimmerClassName =
  "overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[client-form-shimmer_1.25s_ease-in-out_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(46,42,36,0.10),transparent)]";

const LoadingValue = ({ className }: { className: string }) => {
  return <div className={`${className} `} aria-hidden="true" />;
};

export const DeliveryAddressLoadingField = () => {
  return (
    <>
      {/* Mirrors the resolved read-back grid, which stacks on a phone. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            City
          </span>
          <div
            className={`relative rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] ${shimmerClassName}`}
          >
            <LoadingValue className="h-4 w-24" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            Postal code
          </span>
          <div
            className={`relative rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] ${shimmerClassName}`}
          >
            <LoadingValue className="h-4 w-20" />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            Country
          </span>
          <div
            className={`relative rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)] px-3 py-[var(--cf-field-py)] ${shimmerClassName}`}
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
