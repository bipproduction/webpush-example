"use client";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { usePWAInstall } from "@/lib/usePWAInstall";
import { useState } from "react";

// test v1

export function NotificationManager({ publicKey }: { publicKey: string }) {
  const {
    isSupported,
    subscription,
    subscribeToPush,
    unsubscribeFromPush
  } = usePushNotifications(publicKey);
  const { deferredPrompt, isAppInstalled, handleInstallClick } =
    usePWAInstall();
  const [message, setMessage] = useState("halo apa kabar");


  const sendTestNotification = async () => {
    if (!subscription) return;

    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: subscription.toJSON(), message })
      });

      if (!res.ok) {
        console.error("Failed to send notification:", res.statusText);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications & PWA Install</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <div>
              <button onClick={unsubscribeFromPush}>Unsubscribe</button>
            </div>
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div>
              <button onClick={sendTestNotification}>
                Send Test Notification
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
      <hr />
      {!isAppInstalled && deferredPrompt && (
        <button onClick={handleInstallClick}>Install App</button>
      )}
    </div>
  );
}
