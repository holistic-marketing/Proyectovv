self.addEventListener("install", () => {
  // La versión nueva del worker entra sin esperar a que se cierren las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function sameOriginPath(raw) {
  try {
    const url = new URL(raw || "/overview", self.location.origin);
    return url.origin === self.location.origin ? url.href : new URL("/overview", self.location.origin).href;
  } catch {
    return new URL("/overview", self.location.origin).href;
  }
}

self.addEventListener("push", (event) => {
  let payload = { title: "Ads Holistic", body: "", url: "/overview", tag: "", actionLabel: "", image: "" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data ? event.data.text() : "";
  }

  const url = payload.url || "/overview";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/push-badge.png",
    data: { url },
    timestamp: Date.now(),
    // Se queda en pantalla hasta que la toquen (Windows/Android la esconden a los segundos si no).
    requireInteraction: payload.sticky !== false,
    silent: false,
    vibrate: [120, 60, 120],
  };
  if (payload.tag) {
    options.tag = payload.tag;
    options.renotify = true;
  }
  if (payload.image) options.image = payload.image;
  if (payload.actionLabel) options.actions = [{ action: "open", title: payload.actionLabel }];

  // Si la app está abierta, también se muestra adentro: eso lo ve aunque el
  // sistema tenga los avisos de Chrome apagados o en "No molestar".
  const tellOpenTabs = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windows) =>
      windows.forEach((client) =>
        client.postMessage({
          type: "holistic-push",
          payload: { title: payload.title || "Ads Holistic", body: payload.body || "", url, actionLabel: payload.actionLabel || "" },
        }),
      ),
    );

  event.waitUntil(
    Promise.all([self.registration.showNotification(payload.title || "Ads Holistic", options), tellOpenTabs]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = sameOriginPath(event.notification.data && event.notification.data.url);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const mine = windows.find((client) => client.url.startsWith(self.location.origin));
      if (mine && "focus" in mine) {
        return mine.focus().then((client) => (client && "navigate" in client ? client.navigate(target) : undefined));
      }
      return self.clients.openWindow(target);
    }),
  );
});
