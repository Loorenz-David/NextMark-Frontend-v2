import type { ComponentType, SVGProps } from "react";

import {
  BellIcon,
  ChatIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
  RouteIcon,
  ThunderIcon,
} from "@/assets/icons";
import { formatIsoDateRelative } from "@/shared/utils/formatIsoDate";

import type {
  AdminNotificationActorViewModel,
  AdminNotificationBadge,
  AdminNotificationItemViewModel,
} from "./adminNotificationItem.domain";

type AdminNotificationItemProps = {
  item: AdminNotificationItemViewModel;
  onOpen: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
};

const BADGE_ICON: Record<
  AdminNotificationBadge,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  created: PlusIcon,
  updated: EditIcon,
  status: ThunderIcon,
  deleted: DeleteIcon,
  message: ChatIcon,
  route: RouteIcon,
  generic: BellIcon,
};

const BADGE_TONE_CLASS: Record<AdminNotificationBadge, string> = {
  created: "bg-success text-success-on-solid",
  updated: "bg-info text-white",
  status: "bg-warning text-white",
  deleted: "bg-danger text-danger-on-solid",
  message: "bg-info text-white",
  route: "bg-info text-white",
  generic: "bg-border-accent text-text",
};

const AVATAR_CLASS: Record<AdminNotificationActorViewModel["kind"], string> = {
  user: "bg-surface-hover text-text",
  client: "bg-info-bg text-info",
  system: "border border-dashed border-border-accent text-muted",
};

const NotificationAvatar = ({
  actor,
  badge,
}: {
  actor: AdminNotificationActorViewModel;
  badge: AdminNotificationBadge;
}) => {
  const BadgeIcon = BADGE_ICON[badge];
  return (
    <span aria-hidden="true" className="relative mt-0.5 h-9 w-9 shrink-0">
      <span
        className={`flex h-full w-full items-center justify-center rounded-full text-sm font-semibold ${AVATAR_CLASS[actor.kind]}`}
      >
        {actor.kind === "system" ? (
          <BellIcon className="h-4 w-4" />
        ) : (
          actor.initial
        )}
      </span>
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full ring-2 ring-surface ${BADGE_TONE_CLASS[badge]}`}
      >
        <BadgeIcon className="h-2.5 w-2.5" />
      </span>
    </span>
  );
};

export const AdminNotificationItem = ({
  item,
  onOpen,
  onDismiss,
}: AdminNotificationItemProps) => {
  const timeLabel = formatIsoDateRelative(item.occurredAt) ?? item.occurredAt;

  return (
    <div className="group relative">
      <button
        type="button"
        data-popover-close
        onClick={() => onOpen(item.id)}
        className="flex w-full cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:outline-none"
      >
        <NotificationAvatar actor={item.actor} badge={item.badge} />

        <div className="min-w-0 flex-1 pr-6">
          {item.headline ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted">
              <span className="font-semibold text-text">{item.actor.name}</span>{" "}
              {item.headline.verb}{" "}
              <span className="font-semibold text-text">
                {item.headline.subject}
              </span>
            </p>
          ) : (
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-text">
              {item.title}
            </p>
          )}

          {item.detail ? (
            <p
              className="mt-0.5 truncate text-xs text-muted"
              title={item.detail}
            >
              {item.detail}
            </p>
          ) : null}

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[0.68rem]">
            <span className="shrink-0 font-medium text-info">{timeLabel}</span>
            {!item.headline && item.actor.kind !== "system" ? (
              <>
                <span aria-hidden="true" className="text-faint">
                  ·
                </span>
                <span className="truncate text-muted">{item.actor.name}</span>
              </>
            ) : null}
            {item.actor.roleLabel ? (
              <>
                <span aria-hidden="true" className="text-faint">
                  ·
                </span>
                <span className="truncate uppercase tracking-[0.12em] text-faint">
                  {item.actor.roleLabel}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </button>

      <button
        aria-label="Mark notification as read"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted opacity-0 transition hover:bg-surface-hover hover:text-text focus-visible:opacity-100 group-hover:opacity-100"
        onClick={() => onDismiss(item.id)}
        type="button"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
};
