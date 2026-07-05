import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export type DeviceKind = "ios" | "android" | "desktop-chrome" | "desktop-safari" | "desktop-other";

export function detectDevice(): DeviceKind {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return "desktop-safari";
  if (/Chrome|Chromium|Edg/.test(ua)) return "desktop-chrome";
  return "desktop-other";
}

export function usePwaInstall() {
  // El evento puede haber saltado ya (capturado en index.html) antes de que
  // este componente montara — por eso se lee window.__pwaPrompt directamente
  // como estado inicial, en vez de depender solo de un listener que podría
  // llegar tarde.
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(
    () => window.__pwaPrompt ?? null
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onAvailable() {
      setDeferredEvent(window.__pwaPrompt ?? null);
    }
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      setInstalled(true);
      setDeferredEvent(null);
    }
    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  async function promptInstall() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    window.__pwaPrompt = null;
    setDeferredEvent(null);
  }

  return {
    canInstall: Boolean(deferredEvent) && !installed && !isStandalone,
    isInstalled: installed || isStandalone,
    promptInstall,
  };
}
