import { useState, useEffect } from "react";
import { urlB64ToUint8Array } from "./urlB64ToUint8Array";

export function usePushNotifications(publicKey: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/wibu_worker.js",
        {
          scope: "/",
          updateViaCache: "none"
        }
      );
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey)
      });

      const res = await fetch("/api/set-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: sub.toJSON() })
      });

      if (res.ok) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: subscription.toJSON() })
      });
    }
  };

  return {
    isSupported,
    subscription,
    subscribeToPush,
    unsubscribeFromPush
  };
}
