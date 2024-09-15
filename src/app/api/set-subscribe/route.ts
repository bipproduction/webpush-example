/* eslint-disable @typescript-eslint/no-explicit-any */
import webpush from "web-push";
import prisma from "@/lib/prisma";
webpush.setVapidDetails(
  "mailto:bip.production.js@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { sub } = await req.json();
  console.log(sub);
  if (!sub || !sub.endpoint) {
    console.error("Invalid subscription object");
    return new Response("Invalid subscription object", { status: 400 });
  }

  const data = await prisma.subscription.create({
    data: {
      id: sub.keys.auth,
      data: sub
    }
  });

  return new Response(JSON.stringify({ data }));
}
