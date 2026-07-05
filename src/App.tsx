import { useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import DashboardPage from "@/pages/Dashboard";

function FullPageSpinner() {
  return <div className="flex min-h-screen items-center justify-center text-slate">Cargando…</div>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  // Solo redirige si YA estabas autenticado al entrar a esta página (ej. abriste
  // /login con una sesión previa). Si te autenticas mientras estás en esta misma
  // pantalla (login/registro recién hecho), no lo reflejamos aquí — la propia
  // página controla cuándo navegar, para dar tiempo a su animación de éxito.
  const wasAuthedOnMount = useRef<boolean | null>(null);
  if (wasAuthedOnMount.current === null && !loading) {
    wasAuthedOnMount.current = Boolean(user);
  }

  if (loading) return <FullPageSpinner />;
  if (wasAuthedOnMount.current) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthed>
            <RegisterPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
