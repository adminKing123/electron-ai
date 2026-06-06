/**
 * push-sw.js
 * Service Worker for Fuse web push notifications.
 *
 * Registered from usePushNotification.js with:
 *   navigator.serviceWorker.register('/push-sw.js')
 *
 * The notification payload is a JSON string with shape:
 * {
 *   title:              string,
 *   body:               string,
 *   icon?:              string,
 *   image?:             string,
 *   url?:               string,   // click URL
 *   ctaLabel?:          string,
 *   requireInteraction?: boolean,
 * }
 */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "AURA", body: event.data ? event.data.text() : "" };
  }

  const title   = data.title   || "AURA";
  const options = {
    body:               data.body               || "",
    icon:               data.icon               || "/android-chrome-192x192.png",
    image:              data.image              || undefined,
    badge:              "/android-chrome-192x192.png",
    requireInteraction: data.requireInteraction || false,
    data:               { url: data.url || "/" },
  };

  if (data.ctaLabel && data.url) {
    options.actions = [{ action: "open", title: data.ctaLabel }];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing tab if possible
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
