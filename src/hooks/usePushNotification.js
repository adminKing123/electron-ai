/**
 * usePushNotification.js
 * ──────────────────────
 * Manages the full web push subscription lifecycle:
 *
 *   1. Register /push-sw.js service worker (once per session).
 *   2. Query current Notification.permission.
 *   3. Expose requestPermission() to prompt the user.
 *   4. After permission granted: fetch VAPID key, subscribe, POST to backend.
 *   5. Keep the subscription fresh across page loads (re-subscribe if needed).
 *
 * Returns:
 *   {
 *     supported:         boolean,  // browser supports push
 *     permission:        string,   // "default" | "granted" | "denied"
 *     subscribed:        boolean,  // active push subscription exists
 *     requesting:        boolean,  // permission prompt in-flight
 *     requestPermission: () => Promise<void>,
 *   }
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getVapidPublicKeyAPI, pushSubscribeAPI, pushUnsubscribeAPI } from "../apis/fuse/queryFunctions";

// Convert a base64 URL-safe string to a Uint8Array (required by
// PushManager.subscribe for the applicationServerKey option).
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const SW_URL = "/push-sw.js";

export default function usePushNotification() {
  const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

  const [permission,  setPermission]  = useState(supported ? Notification.permission : "denied");
  const [subscribed,  setSubscribed]  = useState(false);
  const [requesting,  setRequesting]  = useState(false);
  const swRegRef = useRef(null);

  // Subscribe the browser to push — fetches the VAPID key, calls PushManager,
  // then POSTs the resulting subscription to the backend.
  const _subscribe = useCallback(async (reg) => {
    try {
      const vapidKey     = await getVapidPublicKeyAPI();
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await pushSubscribeAPI(subscription);
      setSubscribed(true);
    } catch (err) {
      // PushManager may throw if subscription fails (e.g. network error).
      console.warn("[usePushNotification] subscribe failed:", err);
    }
  }, []);

  // Register the service worker and check/restore an existing subscription.
  // Runs once on mount — covers the following cases:
  //   • Same device, page reload           → re-post existing subscription to backend
  //   • New device, permission pre-granted → no existing subscription, auto-subscribe
  //   • Permission not yet granted         → nothing (user must call requestPermission)
  useEffect(() => {
    if (!supported) return;

    navigator.serviceWorker
      .register(SW_URL)
      .then(async (reg) => {
        swRegRef.current = reg;

        if (Notification.permission === "granted") {
          const existing = await reg.pushManager.getSubscription();
          if (existing) {
            setSubscribed(true);
            // Re-post silently so the backend always has this device's latest endpoint
            // (handles logout/login, token rotation, etc.).
            pushSubscribeAPI(existing).catch(() => {});
          } else {
            // Permission granted but no active subscription (e.g. second device,
            // browser reinstall, or subscription expired). Create one so this device
            // receives push notifications like every other logged-in device.
            await _subscribe(reg);
          }
        }
      })
      .catch(() => {});
  }, [supported, _subscribe]);

  const unsubscribe = useCallback(async () => {
    if (!swRegRef.current) return;
    try {
      const existing = await swRegRef.current.pushManager.getSubscription();
      if (existing) {
        // You could also call an API to delete it from the backend if you want
        // await pushUnsubscribeAPI({ endpoint: existing.endpoint });
        await existing.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.warn("[usePushNotification] unsubscribe failed:", err);
    }
  }, []);

  // Ask the user for permission, then subscribe.
  const requestPermission = useCallback(async () => {
    if (!supported || requesting) return;

    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const reg = swRegRef.current
          ?? await navigator.serviceWorker.register(SW_URL);
        swRegRef.current = reg;
        await _subscribe(reg);
      }
    } finally {
      setRequesting(false);
    }
  }, [supported, requesting, _subscribe]);

  return { supported, permission, subscribed, requesting, requestPermission, unsubscribe, subscribe: _subscribe };
}
