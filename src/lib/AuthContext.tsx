import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, apiUpload, ApiError } from "@/lib/api";
import { getRecaptchaToken } from "@/lib/recaptcha";
import { signInWithGoogle, signInWithApple } from "@/lib/socialAuth";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  tier: "BASICO" | "PREMIUM" | "PREMIUM_LITE";
  avatarUrl: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  loginWithApple: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  setTier: (tier: AuthUser["tier"], code?: string) => Promise<{ error?: string }>;
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

  async function loginWithApple() {
    try {
      const { idToken, user: appleUser } = await signInWithApple();
      const data = await apiPost<{ user: AuthUser }>("/auth/apple.php", { idToken, user: appleUser });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError || err instanceof Error ? err.message : "No se pudo iniciar sesión con Apple" };
    }
  }

  async function logout() {
    await apiPost("/auth/logout.php");
    setUser(null);
  }

  async function setTier(tier: AuthUser["tier"], code?: string) {
    try {
      const data = await apiPost<{ user: AuthUser }>("/account/set-tier.php", { tier, code });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo cambiar de plan" };
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
      await apiPost("/account/update-password.php", { currentPassword, newPassword });
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
        loginWithApple,
        logout,
        setTier,
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
