import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellIcon, CloseIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";
import { formatIsoDateRelative } from "@/shared/utils/formatIsoDate";
import { createNotificationsChannel } from "@shared-realtime";
import { adminRealtimeClient } from "@/realtime/client";
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
  subscribeAdminNotifications,
} from "./notification.store";
import {
  playAdminNotificationChime,
  primeAdminNotificationAudio,
} from "./playAdminNotificationChime";
import { AdminNotificationsPushCta } from "./AdminNotificationsPushCta";

const notificationsChannel = createNotificationsChannel(adminRealtimeClient);

export function AdminNotificationsTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIncomingPulseActive, setIsIncomingPulseActive] = useState(false);
  const { items, unreadCount } = useSyncExternalStore(
    subscribeAdminNotifications,
    getAdminNotificationSnapshot,
    getAdminNotificationSnapshot,
  );
  const latestNotificationId = items[0]?.notification_id ?? null;
  const previousNotificationIdRef = useRef<string | number | null>(
    latestNotificationId,
  );

  useEffect(() => {
    const unlockAudio = () => {
      void primeAdminNotificationAudio();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (latestNotificationId == null) {
      previousNotificationIdRef.current = latestNotificationId;
      return;
    }

    const previousId = previousNotificationIdRef.current;
    previousNotificationIdRef.current = latestNotificationId;

    if (previousId == null || previousId === latestNotificationId) {
      return;
    }

    setIsIncomingPulseActive(true);
    void playAdminNotificationChime();
    const timeoutId = window.setTimeout(() => {
      setIsIncomingPulseActive(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [latestNotificationId]);

  const content = useMemo(() => {
    if (items.length === 0) {
      return (
        <div className="admin-glass-popover admin-surface-compact w-[360px] rounded-2xl p-2">
          <div className="admin-glass-divider border-b px-3 py-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Notifications
            </h3>
          </div>
          <div className="admin-glass-divider border-b px-3 py-3">
            <AdminNotificationsPushCta
              visibility="disable-only"
              className="w-full justify-center px-3 py-2"
            />
          </div>
          <div className="px-3 py-4 text-sm text-[var(--color-muted)]">
            No unread notifications.
          </div>
        </div>
      );
    }

    return (
      <div className="admin-glass-popover admin-surface-compact max-h-[420px] w-[360px] overflow-y-auto rounded-2xl p-2">
        <div className="admin-glass-divider border-b px-3 py-3 flex justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Notifications
          </h3>
          <div
            className="underline text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] cursor-pointer"
            onClick={() => {
              markAdminNotificationsReadLocally(
                items.map((item) => item.notification_id),
              );
              notificationsChannel.markRead(
                items.map((item) => item.notification_id),
              );
            }}
          >
            Clear all
          </div>
        </div>
        <div className="admin-glass-divider border-b px-3 py-3">
          <AdminNotificationsPushCta
            visibility="disable-only"
            className="w-full justify-center px-3 py-2"
          />
        </div>

        <div className="divide-y divide-white/8">
          {items.map((notification) => (
            <div
              key={notification.notification_id}
              className="group flex gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.05]"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {notification.title}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {notification.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {formatIsoDateRelative(notification.occurred_at) ??
                      notification.occurred_at}
                  </span>
                </div>
                {notification.actor_username ? (
                  <span className="text-xs font-medium text-[var(--color-text)]/70">
                    {notification.actor_username}
                  </span>
                ) : null}
              </div>

              <button
                aria-label="Mark notification as read"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] opacity-70 transition hover:bg-white/[0.07] hover:opacity-100"
                onClick={() => {
                  markAdminNotificationsReadLocally([
                    notification.notification_id,
                  ]);
                  notificationsChannel.markRead([notification.notification_id]);
                }}
                type="button"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }, [items]);

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      renderInPortal
      closeOnInsideClick
      floatingClassName="drop-shadow-[0_24px_50px_rgba(0,0,0,0.3)]"
      reference={
        <div className="relative">
          <AnimatePresence>
            {isIncomingPulseActive ? (
              <motion.span
                key="notification-trigger-pulse"
                initial={{ scale: 0.72, opacity: 0.45 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 rounded-[18px] border border-[rgb(var(--color-light-blue-r))]/60 bg-[rgb(var(--color-light-blue-r))]/12"
              />
            ) : null}
          </AnimatePresence>

          <motion.div
            animate={
              isIncomingPulseActive
                ? {
                    scale: [1, 1.08, 0.98, 1.04, 1],
                    rotate: [0, -8, 6, -4, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <BasicButton
              params={{
                variant: "toolbarSecondary",
                ariaLabel: "Notifications",
                className: "border-[var(--color-muted)]/30 px-2.5",
                onClick: () => {
                  void primeAdminNotificationAudio();
                  setIsOpen((current) => !current);
                },
              }}
            >
              <BellIcon className="h-4.5 w-4.5" />
            </BasicButton>
          </motion.div>

          {unreadCount > 0 ? (
            <motion.span
              animate={
                isIncomingPulseActive ? { scale: [1, 1.22, 1] } : { scale: 1 }
              }
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[rgb(var(--color-danger-r))] px-1 text-[10px] font-semibold text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          ) : null}
        </div>
      }
    >
      {content}
    </FloatingPopover>
  );
}
