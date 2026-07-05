const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar reCAPTCHA"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Devuelve un token de reCAPTCHA v3 para la acción dada, o null si no hay
 * clave configurada (VITE_RECAPTCHA_SITE_KEY) — en ese caso el backend
 * simplemente no exige verificación todavía.
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!SITE_KEY) return null;

  await loadScript();

  return new Promise((resolve, reject) => {
    window.grecaptcha!.ready(() => {
      window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve).catch(reject);
    });
  });
}
