export const AddressSuggestionLoadingCard = () => {
  return (
    <li aria-hidden="true">
      <div className="flex w-full flex-col gap-2 px-3 py-3">
        <div className="h-3.5 w-36 animate-pulse rounded-full border border-white/8 bg-white/10" />
        <div className="h-3 w-24 animate-pulse rounded-full border border-white/8 bg-white/6" />
      </div>
    </li>
  );
};
