import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
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

  async function login(email: string, password: string) {
    try {
      const data = await apiPost<{ user: AuthUser }>("/auth/login.php", { email, password });
      setUser(data.user);
      return {};
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo iniciar sesión" };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      await apiPost("/auth/register.php", { name, email, password });
      return login(email, password);
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : "No se pudo crear la cuenta" };
    }
  }

  async function logout() {
    await apiPost("/auth/logout.php");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
