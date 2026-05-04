import type { availableChannels, availableEvents } from "../types";

export type TemplateEventDefinition = {
  eventName: availableEvents;
  title: string;
  description: string;
  channel: availableChannels;
};

export const templateEventMap: Record<
  availableEvents,
  TemplateEventDefinition
> = {
  item_created: {
    eventName: "item_created",
    title: "Item Created",
    description:
      "Automatically download a PDF when an item or items are created.",
    channel: "item",
  },

  item_edited: {
    eventName: "item_edited",
    title: "Item Edited",
    description:
      "Automatically download a PDF when an item or items are edited.",
    channel: "item",
  },
  item_rescheduled: {
    eventName: "item_rescheduled",
    title: "Item Rescheduled",
    description:
      "Automatically download a PDF when an item or items are rescheduled.",
    channel: "item",
  },
  route_solution_for_printing: {
    eventName: "route_solution_for_printing",
    title: "Print Route Solution",
    description:
      "Download a PDF of a route details from a selected route solution",
    channel: "route",
  },
};

export const templateEvents = Object.keys(
  templateEventMap,
) as availableEvents[];

export const isTemplateEvent = (value: string): value is availableEvents =>
  value in templateEventMap;
