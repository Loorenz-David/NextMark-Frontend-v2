import {
  selectRoutePlanByServerId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import type { Item } from "../types";
import {
  toDateOnly,
  validateDateComparison,
} from "@/shared/data-validation/timeValidation";

type ExtraProps = {
  delivery_date?: string | null;
  order_scalar_id?: number | null;
};

type ItemForDownloading = {
  itemPayload: Item & ExtraProps;
};

export const itemsForDownloading = (
  items: Item[],
  order_scalar_id?: number | null,
  route_plan_id?: number | null,
) => {
  let planDeliveryDate: string | null = null;
  if (route_plan_id) {
    const plan = selectRoutePlanByServerId(route_plan_id)(
      useRoutePlanStore.getState(),
    );

    const startDate = plan?.start_date ?? "";
    const endDate = plan?.end_date ?? "";
    if (validateDateComparison(startDate, endDate, "are_equal_dates")) {
      planDeliveryDate = toDateOnly(startDate);
    } else {
      planDeliveryDate = toDateOnly(startDate) + "  --  " + toDateOnly(endDate);
    }
  }

  const expandedItems: ItemForDownloading[] = [];
  for (const item of items) {
    if (!item?.quantity) continue;
    for (let i = 0; i < item.quantity; i++) {
      expandedItems.push({
        itemPayload: {
          ...item,
          order_scalar_id,
          delivery_date: planDeliveryDate ?? "",
        },
      });
    }
  }

  return expandedItems;
};
