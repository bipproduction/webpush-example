self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    console.log('Service worker installing...');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service worker activating...');
});

self.addEventListener('push', function (event) {
    console.log('Push event received:', event);


    let title = "Default Title";
    let options = {
        body: "Default notification body",
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2',
        },
    };

    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
            options.icon = data.icon || options.icon;
            options.badge = data.badge || options.badge;
            options.data = {
                ...options.data,
                ...data.data,  // Merging additional data from the event
            };
            
        } catch (e) {
            console.error("Error parsing push event data:", e);
        }
    } else {
        console.warn("Push event has no data.");
    }

    self.registration.showNotification(title, options).catch(err => {
        console.error("Error showing notification:", err);
    })
    console.log('Push notification sent successfully.', options);

    // event.waitUntil(
    //     self.registration.showNotification(title, options).catch(err => {
    //         console.error("Error showing notification:", err);
    //     })
    // );
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');

    event.notification.close(); // Close the notification

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('http://localhost:3005') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('http://localhost:3005');
            }
        }).catch(err => {
            console.error("Error handling notification click:", err);
        })
    );
});
