import type { OrderEventActor } from "../types/orderEvent";

export type OrderEventActorViewModel = {
  name: string;
  initial: string;
  roleLabel: string | null;
  isSystem: boolean;
};

const SYSTEM_ACTOR: OrderEventActorViewModel = {
  name: "System",
  initial: "",
  roleLabel: null,
  isSystem: true,
};

const toNonEmpty = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const mapOrderEventActorToViewModel = (
  actor: OrderEventActor | null | undefined,
): OrderEventActorViewModel => {
  const name = toNonEmpty(actor?.username);
  if (!actor || !name) return SYSTEM_ACTOR;

  return {
    name,
    initial: name.charAt(0).toUpperCase(),
    roleLabel: toNonEmpty(actor.role_name) ?? toNonEmpty(actor.base_role),
    isSystem: false,
  };
};
