import { apiGet, apiPost } from "@/lib/api";

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Activa los avisos push de "Llamar" en este dispositivo/navegador para la cuenta admin. */
export async function subscribeToCallPush(): Promise<{ error?: string }> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { error: "Este navegador no soporta notificaciones push." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { error: "Has bloqueado los avisos — actívalos en los ajustes del navegador para este sitio." };
    }

    const { publicKey } = await apiGet<{ publicKey: string }>("/push/vapid-public-key.php");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    const json = subscription.toJSON();
    await apiPost("/push/subscribe.php", { endpoint: json.endpoint, keys: json.keys });

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo activar el aviso en este dispositivo." };
  }
}
