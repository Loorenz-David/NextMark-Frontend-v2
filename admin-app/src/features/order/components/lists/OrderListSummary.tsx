import { pluralLabel } from "@shared-utils";

import type { OrderStats } from "../../types/orderMeta";

type OrderListSummaryProps = {
  orderStats?: OrderStats;
};

/** "120 orders • 340 items" line at the top of the order list; scrolls with it. */
export const OrderListSummary = ({ orderStats }: OrderListSummaryProps) => {
  const ordersCount = orderStats?.orders?.total ?? 0;
  const itemsCount = orderStats?.items?.total ?? 0;

  return (
    <p className="px-3 pt-3 text-xs text-[var(--color-muted)]">
      {ordersCount} {pluralLabel("order", ordersCount)} • {itemsCount}{" "}
      {pluralLabel("item", itemsCount)}
    </p>
  );
};
