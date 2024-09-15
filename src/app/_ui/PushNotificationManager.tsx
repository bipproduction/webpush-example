"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

// Utility to convert VAPID public key from URL-safe base64 to Uint8Array
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
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("halo apa kabar");

  // Check if push notifications are supported and register the service worker
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      console.warn("Push notifications are not supported in this browser.");
    }
  }, []);

  // Load current subscription status
  async function loadSubs() {
    try {
      const res = await fetch("/api/get-subscribe");
      if (res.ok) {
        const sub = await res.json();
        console.log("Loaded subscription:", JSON.stringify(sub, null, 2));
        setSubscription(sub as PushSubscription);
      } else {
        console.warn("Failed to load subscription:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  // Register service worker and check for an existing subscription
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none"
      });
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        console.log("Already subscribed to push notifications:", sub);
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  // Subscribe to push notifications
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
        body: JSON.stringify({ sub: sub.toJSON() }) // Convert subscription to JSON before sending
      });

      if (res.ok) {
        setSubscription(sub);
        console.log("Successfully subscribed:", sub);
      } else {
        console.error("Failed to subscribe:", res.statusText);
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  }

  // Unsubscribe from push notifications
  async function unsubscribeFromPush() {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);

        await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sub: subscription.toJSON() })
        });

        console.log("Successfully unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Unsubscription error:", error);
    }
  }

  // Send a test notification
  async function sendTestNotification() {
    if (!subscription) {
      console.warn("You must be subscribed to send a notification.");
      return;
    }

    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub: subscription.toJSON(),
          message
        })
      });

      if (res.ok) {
        console.log("Test notification sent successfully");
      } else {
        console.error("Failed to send notification:", res.statusText);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>
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
    </div>
  );
}
