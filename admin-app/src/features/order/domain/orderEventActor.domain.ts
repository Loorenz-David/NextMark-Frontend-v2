import type { OrderEvent } from "../types/orderEvent";

export type OrderEventActorKind = "user" | "client" | "system";

export type OrderEventActorViewModel = {
  kind: OrderEventActorKind;
  name: string;
  initial: string;
  roleLabel: string | null;
};

const SYSTEM_ACTOR: OrderEventActorViewModel = {
  kind: "system",
  name: "System",
  initial: "",
  roleLabel: null,
};

const toNonEmpty = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const mapOrderEventActorToViewModel = (
  event: Pick<OrderEvent, "actor" | "origin" | "relayed_by">,
): OrderEventActorViewModel => {
  if (event.origin === "client") {
    // The customer's own form. A linked-device submission names the staff
    // member whose device relayed it; the public link has no one to name.
    const relayedBy = toNonEmpty(event.relayed_by?.username);
    return {
      kind: "client",
      name: "Client",
      initial: "C",
      roleLabel: relayedBy ? `via ${relayedBy}` : "Form link",
    };
  }

  const actor = event.actor;
  const name = toNonEmpty(actor?.username);
  if (!actor || !name) return SYSTEM_ACTOR;

  return {
    kind: "user",
    name,
    initial: name.charAt(0).toUpperCase(),
    roleLabel: toNonEmpty(actor.role_name) ?? toNonEmpty(actor.base_role),
  };
};
