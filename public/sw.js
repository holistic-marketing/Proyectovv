self.addEventListener("install", () => {
  // La versión nueva del worker entra sin esperar a que se cierren las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "Ads Holistic", body: "", url: "/overview", tag: "" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data ? event.data.text() : "";
  }

  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/push-badge.png",
    data: { url: payload.url || "/overview" },
    timestamp: Date.now(),
  };
  if (payload.tag) options.tag = payload.tag;

  event.waitUntil(self.registration.showNotification(payload.title || "Ads Holistic", options));
});

function sameOriginPath(raw) {
  try {
    const url = new URL(raw || "/overview", self.location.origin);
    return url.origin === self.location.origin ? url.href : new URL("/overview", self.location.origin).href;
  } catch {
    return new URL("/overview", self.location.origin).href;
  }
}

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
