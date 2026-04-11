import { planPopupRegistry } from "@/features/plan/";
import { popupRegistry as orderPopupRegistry } from "@/features/order/registry/orderPopups.registry";
import { costumerPopupRegistry } from "@/features/costumer/registry/costumerPopups.registry";
import { zonePopupRegistry } from "@/features/zone/registry/zone.popups.registry";
// import { itemPopupRegistry } from '@/features/item/registry/itemPopups'

export const homePopupRegistry = {
  ...planPopupRegistry,
  ...orderPopupRegistry,
  ...costumerPopupRegistry,
  ...zonePopupRegistry,
  // ...itemPopupRegistry
};

export const loadingPopupRegistry = {};
