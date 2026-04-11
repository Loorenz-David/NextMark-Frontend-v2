type StopDetailHeaderTitleProps = {
  streetAddress: string;
  stopMeta: string;
  orderScalarLabel: string | null;
};

export function StopDetailHeaderTitle({
  streetAddress,
  stopMeta,
  orderScalarLabel,
}: StopDetailHeaderTitleProps) {
  return (
    <div className="min-w-0">
      <h2 className="flex flex-col gap-1line-clamp-2 text-lg font-semibold leading-tight text-white">
        {streetAddress}
      </h2>
      <div className="flex gap-3 items-end">
        {orderScalarLabel ? (
          <p className="text-sm font-semibold tracking-[0.08em] text-white/65">
            {orderScalarLabel}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-white/65">{stopMeta}</p>
      </div>
    </div>
  );
}
