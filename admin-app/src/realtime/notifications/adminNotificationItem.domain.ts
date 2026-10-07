import type { NotificationActorKind, NotificationItem } from "@shared-realtime";

export type AdminNotificationBadge =
  | "created"
  | "updated"
  | "status"
  | "deleted"
  | "message"
  | "route"
  | "generic";

export type AdminNotificationActorViewModel = {
  kind: NotificationActorKind;
  name: string;
  initial: string;
  roleLabel: string | null;
};

/** "<actor> <verb> <subject>", e.g. "david updated Order #2549". */
export type AdminNotificationHeadline = {
  verb: string;
  subject: string;
};

export type AdminNotificationItemViewModel = {
  id: string;
  actor: AdminNotificationActorViewModel;
  headline: AdminNotificationHeadline | null;
  /** Shown in place of the headline when the notification has no subject. */
  title: string;
  /** The detail's " · "-separated parts, one per line. */
  detailLines: string[];
  badge: AdminNotificationBadge;
  occurredAt: string;
};

const toNonEmpty = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveActorKind = (
  notification: NotificationItem,
): NotificationActorKind => {
  if (notification.actor_kind) return notification.actor_kind;
  // Notifications stored before actor_kind existed.
  return toNonEmpty(notification.actor_username) ? "user" : "system";
};

const mapActor = (
  notification: NotificationItem,
): AdminNotificationActorViewModel => {
  const kind = resolveActorKind(notification);
  const username = toNonEmpty(notification.actor_username);

  if (kind === "client") {
    return { kind, name: "Client", initial: "C", roleLabel: null };
  }
  if (kind === "user" && username) {
    return {
      kind,
      name: username,
      initial: username.charAt(0).toUpperCase(),
      roleLabel: toNonEmpty(notification.actor_role),
    };
  }
  return { kind: "system", name: "System", initial: "", roleLabel: null };
};

const resolveVerb = (
  notification: NotificationItem,
  actorKind: NotificationActorKind,
) => {
  // The backend names the action when it knows it (scheduled, reordered
  // stops on, …), for orders and routes alike.
  const actionLabel = toNonEmpty(notification.action_label);
  if (actionLabel) {
    return actionLabel;
  }
  switch (notification.kind) {
    case "order.created":
      return "created";
    case "order.updated":
      return actorKind === "client" ? "submitted the form for" : "updated";
    case "order.state_changed":
      return "changed the status of";
    default:
      return null;
  }
};

const formatChanges = (labels: string[], total: number) => {
  const remaining = total - labels.length;
  const listed = labels.join(", ");
  return remaining > 0 ? `${listed} +${remaining} more` : listed;
};

const resolveDetail = (notification: NotificationItem) => {
  // A detail written for this notification (where an order moved, what a
  // route change did) says more than a list of changed field names.
  const detail = toNonEmpty(notification.detail);
  if (detail) {
    return detail;
  }
  const labels = notification.change_labels ?? [];
  if (labels.length > 0) {
    return `Changed ${formatChanges(labels, notification.change_count ?? labels.length)}`;
  }
  // "Order #12 was created." only repeats the headline.
  if (notification.kind === "order.created" && notification.subject_label) {
    return null;
  }
  return toNonEmpty(notification.description);
};

const DETAIL_SEPARATOR = " · ";

const splitDetail = (detail: string | null): string[] =>
  (detail ?? "")
    .split(DETAIL_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

const resolveBadge = (kind: string): AdminNotificationBadge => {
  if (kind === "order_chat.message_created") return "message";
  if (kind.endsWith(".deleted")) return "deleted";
  if (kind.endsWith(".state_changed")) return "status";
  if (kind.endsWith(".created")) return "created";
  if (kind.startsWith("route_") || kind === "local_delivery_plan.updated") {
    return "route";
  }
  if (kind.endsWith(".updated")) return "updated";
  return "generic";
};

export const mapNotificationToAdminViewModel = (
  notification: NotificationItem,
): AdminNotificationItemViewModel => {
  const actor = mapActor(notification);
  const verb = resolveVerb(notification, actor.kind);
  const subject = toNonEmpty(notification.subject_label);

  return {
    id: notification.notification_id,
    actor,
    headline: verb && subject ? { verb, subject } : null,
    title: notification.title,
    detailLines: splitDetail(resolveDetail(notification)),
    badge: resolveBadge(notification.kind),
    occurredAt: notification.occurred_at,
  };
};
