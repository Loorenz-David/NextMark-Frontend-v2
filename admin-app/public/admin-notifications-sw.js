const ADMIN_NOTIFICATION_QUERY_PARAM = "adminNotification";
const ADMIN_NOTIFICATION_MESSAGE_TYPE = "admin-notification-click";

const isObject = (value) => value != null && typeof value === "object";

const normalizeLaunchPayload = (payload) => {
  if (!isObject(payload)) return null;
  if (
    typeof payload.notification_id === "string" &&
    typeof payload.occurred_at === "string" &&
    isObject(payload.target)
  ) {
    return payload;
  }

  if (
    typeof payload.notification_id === "string" &&
    typeof payload.occurred_at === "string" &&
    isObject(payload.target)
  ) {
    return {
      notification_id: payload.notification_id,
      occurred_at: payload.occurred_at,
      target: payload.target,
    };
  }

  return null;
};

const buildLaunchPayload = (pushPayload) => {
  if (isObject(pushPayload) && isObject(pushPayload.notification)) {
    return normalizeLaunchPayload(pushPayload.notification);
  }

  return normalizeLaunchPayload(pushPayload);
};

const encodeLaunchPayload = (payload) =>
  encodeURIComponent(JSON.stringify(payload));

self.addEventListener("push", (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const launchPayload = buildLaunchPayload(payload);
  const title =
    (isObject(payload.notification) && payload.notification.title) ||
    payload.title ||
    "New notification";
  const body =
    (isObject(payload.notification) && payload.notification.description) ||
    payload.body ||
    payload.description ||
    "";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag:
        launchPayload?.notification_id ||
        payload.notification_id ||
        payload.tag ||
        "admin-notification",
      timestamp: launchPayload?.occurred_at
        ? Date.parse(launchPayload.occurred_at)
        : Date.now(),
      data: {
        launchPayload,
      },
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const launchPayload = event.notification.data?.launchPayload || null;
  const targetUrl = new URL(self.registration.scope);
  if (launchPayload) {
    targetUrl.searchParams.set(
      ADMIN_NOTIFICATION_QUERY_PARAM,
      encodeLaunchPayload(launchPayload),
    );
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients[0] || null;

      if (existingClient) {
        existingClient.postMessage({
          type: ADMIN_NOTIFICATION_MESSAGE_TYPE,
          payload: launchPayload,
        });
        return existingClient.focus();
      }

      return self.clients.openWindow(targetUrl.toString());
    }),
  );
});
