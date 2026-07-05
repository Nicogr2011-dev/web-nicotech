// Service worker mínimo: solo existe para que el navegador considere la web
// instalable como PWA. No cachea nada (evita servir versiones antiguas de la
// app tras cada despliegue) — cada petición pasa directa a la red.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
