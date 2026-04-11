import type { ClientFormItem } from "../domain/clientForm.types";

type ClientFormItemsListProps = {
  items: ClientFormItem[];
};

export const ClientFormItemsList = ({ items }: ClientFormItemsListProps) => {
  if (!items.length) return null;

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-white">
            Items
          </h2>
          <p className="text-xs text-white/46">
            Review the items included in this order.
          </p>
        </div>
        <span className="rounded-full border border-[#83ccb9]/25 bg-[#83ccb9]/12 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#9fe4d1]">
          {items.length} {items.length === 1 ? "line" : "lines"}
        </span>
      </div>

      <div
        className="mt-4 flex flex-col divide-y divide-white/8 overflow-hidden rounded-[18px] border  bg-black/10"
        style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
      >
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {item.name || "Unnamed item"}
              </p>
            </div>

            <div className="shrink-0 text-right ">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                Qty
              </p>
              <p className="text-sm font-semibold text-[#9fe4d1]">
                {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
