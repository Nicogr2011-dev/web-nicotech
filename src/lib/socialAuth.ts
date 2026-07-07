const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined;

export const googleSignInAvailable = Boolean(GOOGLE_CLIENT_ID);
export const appleSignInAvailable = Boolean(APPLE_CLIENT_ID);

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
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
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

let appleScriptPromise: Promise<void> | null = null;

function loadAppleScript(): Promise<void> {
  if (appleScriptPromise) return appleScriptPromise;
  appleScriptPromise = new Promise((resolve, reject) => {
    if (window.AppleID) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Apple Sign-In"));
    document.head.appendChild(script);
  });
  return appleScriptPromise;
}

/** Abre el selector de cuenta de Apple y devuelve el id_token (+ nombre, solo la primera vez). */
export async function signInWithApple(): Promise<{ idToken: string; user: unknown }> {
  if (!APPLE_CLIENT_ID) throw new Error("El inicio de sesión con Apple todavía no está configurado.");
  await loadAppleScript();

  window.AppleID!.auth.init({
    clientId: APPLE_CLIENT_ID,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
  });
  const result = await window.AppleID!.auth.signIn();
  return { idToken: result.authorization.id_token, user: result.user ?? null };
}
