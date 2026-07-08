import { useCallback, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useKonamiCode } from "@/lib/useKonamiCode";
import { Confetti } from "@/components/Confetti";
import { CookieConsent } from "@/components/CookieConsent";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import DashboardPage from "@/pages/Dashboard";
import InstallAppPage from "@/pages/InstallApp";
import PricingPage from "@/pages/Pricing";
import CheckoutPage from "@/pages/Checkout";
import AccountPage from "@/pages/Account";

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
  const [showConfetti, setShowConfetti] = useState(false);

  const handleKonami = useCallback(() => {
    setShowConfetti(true);
    window.dispatchEvent(new Event("nicotech:party"));
  }, []);
  useKonamiCode(handleKonami);

  return (
    <>
      {showConfetti ? <Confetti onDone={() => setShowConfetti(false)} /> : null}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/instalar" element={<InstallAppPage />} />
        <Route path="/precios" element={<PricingPage />} />
        <Route
          path="/pago/:tier"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
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
          path="/recuperar"
          element={
            <RedirectIfAuthed>
              <ForgotPasswordPage />
            </RedirectIfAuthed>
          }
        />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cuenta"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
    </>
  );
}
