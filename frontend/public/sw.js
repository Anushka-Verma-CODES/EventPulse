
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let data;

  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'EventPulse',
      body: event.data.text(),
    };
  }

  const title = data.title || 'EventPulse';

  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/event-hero.png',
    badge: '/event-hero.png',
    data: {
      url: data.url || '/notifications',
      notificationId: data.notificationId || null,
    },
    tag: data.notificationId || undefined,
    renotify: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/notifications',
    self.location.origin,
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
