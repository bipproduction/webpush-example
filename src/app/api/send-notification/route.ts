/* eslint-disable @typescript-eslint/no-explicit-any */
import webpush from "web-push";
import prisma from "@/lib/prisma";

// Set VAPID details for web-push
webpush.setVapidDetails(
  "mailto:bip.production.js@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  try {
    // Fetch all subscriptions from your database
    const subscriptions = await prisma.subscription.findMany();

    if (!subscriptions || subscriptions.length === 0) {
      console.error("No subscriptions available to send notification");
      return new Response("No subscriptions available", { status: 400 });
    }

    // Notification payload
    const notificationPayload = JSON.stringify({
      title: "Test Notification",
      body: "This is a test notification",
      icon: "/icon.png",
      badge: "/badge.png"
    });

    let successCount = 0;
    let failureCount = 0;

    // Loop through all subscriptions and send notifications
    for (const sub of subscriptions) {
      try {
        const subscriptionData = sub.data as any;

        await webpush.sendNotification(subscriptionData, notificationPayload);
        console.log(
          `Notification sent successfully to ${subscriptionData.endpoint}`
        );
        successCount++;
      } catch (error: any) {
        console.error(
          `Error sending push notification to subscription ${sub.id}:`,
          error
        );
        failureCount++;
      }
    }

    // Return a success or failure response
    return new Response(
      JSON.stringify({
        message: `Notifications sent: ${successCount}, Failed: ${failureCount}`,
        success: failureCount === 0
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error during notification process:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process notifications"
      }),
      { status: 500 }
    );
  }
}
