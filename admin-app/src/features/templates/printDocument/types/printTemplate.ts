export type availableChannels = "item" | "order" | "route";

export type availableVariants = "classic" | "7cm - 10cm";

export type availableEvents =
  | "item_created"
  | "item_edited"
  | "route_solution_for_printing"
  | "item_rescheduled";
// to add  | "order_created"
// | "order_confirmed"
// | "order_edited"

export type availableOrientations = "horizontal" | "vertical";
export type PrintTemplate = {
  id?: number;
  client_id: string;
  enable: boolean;
  channel: availableChannels;
  selected_variant: availableVariants;
  event: availableEvents;
  orientation: availableOrientations;
  ask_permission: boolean;
};

export type PrintTemplateMap = {
  byClientId: Record<string, PrintTemplate>;
  allIds: string[];
};

export type PrintOrderActions = "on_create_order";
