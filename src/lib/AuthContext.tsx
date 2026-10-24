import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, apiUpload, ApiError } from "@/lib/api";
import { getRecaptchaToken } from "@/lib/recaptcha";
import { signInWithGoogle } from "@/lib/socialAuth";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  tier: "BASICO" | "PREMIUM" | "PREMIUM_LITE";
  avatarUrl: string | null;
  /** false en cuentas creadas con Google que aún no han creado contraseña. */
  hasPassword: boolean;
  /** Hasta confirmar el email no se pueden guardar suscripciones. */
  emailVerified: boolean;
  /** Email nuevo pendiente de confirmar desde el enlace (el actual sigue siendo `email`). */
  pendingEmail: string | null;
  /** Plan de pago de Nicotech; null en Básico. */
  plan: {
    interval: "year" | "month" | null;
    /** Pagado con Stripe (si no, se activó con un código). */
    viaStripe: boolean;
    startedAt: string | null;
    renewsAt: string | null;
    /** Si se ha dado de baja: hasta cuándo conserva el plan. */
    endsAt: string | null;
  } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  cancelPlan: () => Promise<{ error?: string }>;
  verifyEmail: (token: string) => Promise<{ error?: string }>;
  resendVerification: () => Promise<{ error?: string }>;
  updateName: (name: string) => Promise<{ error?: string }>;
  updateEmail: (email: string, currentPassword: string) => Promise<{ error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ error?: string }>;
  deleteAccount: (password: string) => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<{ user: AuthUser | null }>("/auth/me.php");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(email: string, password: string, remember = true) {
    try {
      const recaptchaToken = await getRecaptchaToken("login").catch(() => null);
      const data = await apiPost<{ user: AuthUser }>("/auth/login.php", {
        email,
        password,
        recaptchaToken,
        remember,
      });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo iniciar sesión" };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const recaptchaToken = await getRecaptchaToken("register").catch(() => null);
      await apiPost("/auth/register.php", { name, email, password, recaptchaToken });
      return login(email, password);
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo crear la cuenta" };
    }
  }

  async function loginWithGoogle() {
    try {
      const accessToken = await signInWithGoogle();
      const data = await apiPost<{ user: AuthUser }>("/auth/google.php", { accessToken });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError || err instanceof Error ? err.message : "No se pudo iniciar sesión con Google" };
    }
  }

  async function logout() {
    try {
      await apiPost("/auth/logout.php");
    } catch {
      // Aunque falle la red, en este dispositivo se cierra igual: la cookie de sesión
      // caduca sola y no tiene sentido dejar al usuario "dentro" con un error.
    } finally {
      setUser(null);
    }
  }

  async function cancelPlan() {
    try {
      const data = await apiPost<{ user: AuthUser }>("/billing/cancel.php");
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo dar de baja el plan" };
    }
  }

  async function verifyEmail(token: string) {
    try {
      await apiPost("/auth/verify-email.php", { token });
      // El enlace puede abrirse sin sesión: si la hay, recargamos el usuario.
      await refresh();
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo confirmar el email" };
    }
  }

  async function resendVerification() {
    try {
      await apiPost("/auth/resend-verification.php");
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo reenviar el correo" };
    }
  }

  async function updateName(name: string) {
    try {
      const data = await apiPost<{ user: AuthUser }>("/account/update-name.php", { name });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo actualizar el nombre" };
    }
  }

  async function updateEmail(email: string, currentPassword: string) {
    try {
      const data = await apiPost<{ user: AuthUser }>("/account/update-email.php", { email, currentPassword });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo actualizar el email" };
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    try {
      const data = await apiPost<{ user: AuthUser }>("/account/update-password.php", { currentPassword, newPassword });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo actualizar la contraseña" };
    }
  }

  async function uploadAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await apiUpload<{ user: AuthUser }>("/account/upload-avatar.php", formData);
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo subir la foto" };
    }
  }

  async function deleteAccount(password: string) {
    try {
      await apiPost("/account/delete-account.php", { password });
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo eliminar la cuenta" };
    }
  }

  async function forgotPassword(email: string) {
    try {
      await apiPost("/auth/forgot-password.php", { email });
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo procesar la solicitud" };
    }
  }

  async function resetPassword(token: string, password: string) {
    try {
      await apiPost("/auth/reset-password.php", { token, password });
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña" };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        cancelPlan,
        verifyEmail,
        resendVerification,
        updateName,
        updateEmail,
        updatePassword,
        uploadAvatar,
        deleteAccount,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
