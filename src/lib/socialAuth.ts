const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const googleSignInAvailable = Boolean(GOOGLE_CLIENT_ID);

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
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
    script.onerror = () => reject(new Error("No se pudo cargar Google Sign-In"));
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
    });
    client.requestAccessToken();
  });
}
