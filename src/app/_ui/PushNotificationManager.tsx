"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

export const urlB64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function PushNotificationManager({ publicKey }: { publicKey: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("halo apa kabar");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Check if push notifications are supported and register the service worker
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      console.warn("Push notifications are not supported in this browser.");
    }

    // Check for PWA install prompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Detect if the app is installed
    window.addEventListener("appinstalled", () => {
      console.log("PWA installed successfully");
      setIsAppInstalled(true);
    });
  }, []);

  async function loadSubs() {
    try {
      const res = await fetch("/api/get-subscribe");
      if (res.ok) {
        const sub = await res.json();
        setSubscription(sub as PushSubscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none"
      });
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
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
  }

  async function unsubscribeFromPush() {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: subscription.toJSON() })
      });
    }
  }

  async function sendTestNotification() {
    if (!subscription) return;

    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: subscription.toJSON(), message })
      });

      if (res.ok) {
        console.log("Notification sent successfully");
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  }

  // Handle install button click
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div>
      <h3>Push Notifications & PWA Install</h3>
      <button onClick={loadSubs}>Load Subscription</button>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test Notification</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
      {!isAppInstalled && deferredPrompt && (
        <button onClick={handleInstallClick}>Install App</button>
      )}
    </div>
  );
}
