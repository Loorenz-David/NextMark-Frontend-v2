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
  order_notes?: unknown;
  order_scalar_id?: string | null;
  help_to_carry?: boolean | null;
  order_plan_objective?: string | null;
};

type ItemForDownloading = {
  itemPayload: Item & ExtraProps;
};

type OrderLabelIdentifierSource = {
  order_scalar_id?: string | number | null;
  reference_number?: string | null;
  external_source?: string | null;
  help_to_carry?: boolean | null;
  order_plan_objective?: string | null;
};

const formatItemLabelOrderIdentifier = (value: string | number | null | undefined) => {
  if (value == null) return null;

  const identifier = String(value).trim();
  if (!identifier) return null;

  return identifier.startsWith("#") ? identifier : `#${identifier}`;
};

export const resolveItemLabelOrderIdentifier = (
  source?: OrderLabelIdentifierSource | number | null,
): string | null => {
  if (typeof source === "number") return formatItemLabelOrderIdentifier(source);
  if (!source) return null;

  const referenceNumber = source.reference_number?.trim();
  const externalSource = source.external_source?.trim();

  if (externalSource && referenceNumber) {
    return formatItemLabelOrderIdentifier(referenceNumber);
  }

  return formatItemLabelOrderIdentifier(source.order_scalar_id);
};

export const itemsForDownloading = (
  items: Item[],
  orderIdentifier?: OrderLabelIdentifierSource | number | null,
  route_plan_id?: number | null,
  order_notes?: unknown,
) => {
  const order_scalar_id = resolveItemLabelOrderIdentifier(orderIdentifier);
  const orderSymbols =
    typeof orderIdentifier === "object" && orderIdentifier
      ? {
          help_to_carry: orderIdentifier.help_to_carry ?? null,
          order_plan_objective: orderIdentifier.order_plan_objective ?? null,
        }
      : {
          help_to_carry: null,
          order_plan_objective: null,
        };
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
          ...orderSymbols,
          delivery_date: planDeliveryDate ?? "",
          order_notes,
        },
      });
    }
  }

  return expandedItems;
};
