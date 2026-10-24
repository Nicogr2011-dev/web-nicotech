import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { ButtonLink } from "@/components/ui/Button";
import { CenteredAuthLayout } from "@/components/auth/CenteredAuthLayout";

/** Destino del enlace del correo de confirmación (alta o cambio de email). */
export default function VerifyEmailPage() {
  const { user, verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // StrictMode monta el efecto dos veces en desarrollo, y el token solo vale una.
    if (started.current) return;
    started.current = true;
    verifyEmail(token).then(({ error: err }) => {
      setError(err ?? null);
      setStatus(err ? "error" : "ok");
    });
  }, [token, verifyEmail]);

  return (
    <CenteredAuthLayout>
      {status === "pending" ? (
        <p className="text-muted">Confirmando tu email…</p>
      ) : status === "ok" ? (
        <>
          <h1 className="font-display text-xl font-extrabold text-body">¡Email confirmado!</h1>
          <p className="mt-3 text-sm text-muted">Ya puedes usar Nicotech con normalidad.</p>
          <ButtonLink href={user ? "/dashboard" : "/login"} className="mt-6 w-full">
            {user ? "Ir a mis suscripciones" : "Iniciar sesión"}
          </ButtonLink>
        </>
      ) : (
        <>
          <h1 className="font-display text-xl font-extrabold text-body">No se pudo confirmar</h1>
          <p className="mt-3 text-sm text-coral">{error}</p>
          <ButtonLink href={user ? "/dashboard" : "/login"} variant="secondary" className="mt-6 w-full">
            {user ? "Volver" : "Iniciar sesión"}
          </ButtonLink>
        </>
      )}
    </CenteredAuthLayout>
  );
}
