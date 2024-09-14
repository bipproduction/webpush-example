self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    console.log('Service worker installing...');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
});
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || "No message body",
            icon: data.icon || '/icon.png',
            badge: '/badge.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
            },
        };
        event.waitUntil(self.registration.showNotification(data.title || "Default Title", options));
    } else {
        // Fallback if event.data is not present
        const options = {
            body: "Default notification body",
            icon: '/icon.png',
            badge: '/badge.png',
            vibrate: [100, 50, 100],
        };
        event.waitUntil(self.registration.showNotification("Default Title", options));
    }
});


self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');
    event.notification.close(); // Close the notification
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === 'https://your-website.com' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('https://your-website.com');
            }
        })
    );
});
