/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationManager } from "./_ui/NotificationManager";
// import { PushNotificationManager } from "./_ui/PushNotificationManager";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

console.log(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default function Page() {
  return (
    <div>
      {/* <PushNotificationManager publicKey={publicKey} /> */}
      <NotificationManager publicKey={publicKey} />
    </div>
  );
}
