const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: { type: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptPromise = null; // que el siguiente intento lo vuelva a cargar
      script.remove();
      reject(new Error("No se pudo cargar Google Sign-In"));
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

/** Abre el selector de cuenta de Google y devuelve un access token, o lanza si falla/lo cierras. */
export async function signInWithGoogle(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) throw new Error("El inicio de sesión con Google todavía no está configurado.");
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error("No se pudo iniciar sesión con Google"));
      },
      // Cerrar la ventana de Google (o que el navegador la bloquee) no llama a
      // callback: sin esto la promesa no terminaba y el login se quedaba bloqueado.
      error_callback: (error) =>
        reject(
          new Error(
            error.type === "popup_closed"
              ? "Has cerrado la ventana de Google"
              : error.type === "popup_failed_to_open"
                ? "El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo de nuevo."
                : "No se pudo iniciar sesión con Google"
          )
        ),
    });
    client.requestAccessToken();
  });
}
