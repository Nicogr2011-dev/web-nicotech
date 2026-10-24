import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";
import { CenteredAuthLayout } from "@/components/auth/CenteredAuthLayout";

/** Lo que ve una cuenta sin confirmar en vez del panel, hasta que abra el enlace del correo. */
export function VerifyEmailGate() {
  const { user, resendVerification, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleResend() {
    setPending(true);
    setMessage(null);
    const { error } = await resendVerification();
    setPending(false);
    setMessage(error ? { type: "error", text: error } : { type: "ok", text: "Te lo hemos vuelto a enviar." });
  }

  return (
    <CenteredAuthLayout>
      <h1 className="font-display text-xl font-extrabold text-body">Confirma tu email</h1>
      <p className="mt-3 text-sm text-muted">
        Te hemos enviado un enlace a <span className="font-semibold text-body">{user?.email}</span>. Ábrelo para empezar
        a usar Nicotech. Si no lo ves, mira en la carpeta de spam.
      </p>

      {message ? (
        <p className={message.type === "ok" ? "mt-4 text-sm text-mint" : "mt-4 text-sm text-coral"}>{message.text}</p>
      ) : null}

      <Button className="mt-6 w-full" disabled={pending} onClick={handleResend}>
        {pending ? "Enviando…" : "Reenviar el correo"}
      </Button>

      <div className="mt-4 flex justify-between text-sm font-medium">
        <Link to="/cuenta" className="text-azure hover:underline">
          Cambiar el email
        </Link>
        <button type="button" onClick={logout} className="text-muted hover:text-body">
          Cerrar sesión
        </button>
      </div>
    </CenteredAuthLayout>
  );
}
