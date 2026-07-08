// Service worker mínimo: solo existe para que el navegador considere la web
// instalable como PWA. No cachea nada (evita servir versiones antiguas de la
// app tras cada despliegue) — cada petición pasa directa a la red.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Avisos de "Llamar" desde /contacto: se mandan sin contenido (solo disparan
// este evento), así que el texto se decide aquí, no en el servidor.
self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("Llamada entrante en Nicotech", {
      body: "Alguien te está llamando desde /contacto.",
      icon: "/icons/icon-192.png",
      tag: "nicotech-call",
      requireInteraction: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/#/contacto"));
});
