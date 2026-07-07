import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/Card";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { MailIcon } from "@/components/ui/Icon";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    setError(null);

    if (!email.trim()) {
      setError("Introduce tu email");
      return;
    }

    setPending(true);
    const result = await forgotPassword(email);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f7f8fa 45%, #fef6ea 100%)" }}
    >
      <div className="w-full max-w-[400px]">
        <div className="mb-5 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold text-ink">
            Nico<span className="text-azure">tech</span>
          </Link>
          <div className="mt-2.5 flex justify-center">
            <PaletteDots size={7} />
          </div>
        </div>

        <Card className="p-8" style={{ animation: "card-in 0.35s ease-out" }}>
          <h1 className="text-center font-display text-xl font-extrabold text-ink">Recupera tu contraseña</h1>
          <p className="mt-1.5 text-center text-sm text-slate">
            Te enviaremos un enlace a tu email para restablecerla.
          </p>

          {sent ? (
            <p className="mt-6 text-center text-sm text-mint">
              Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer tu contraseña.
              Revisa tu bandeja de entrada (y el spam).
            </p>
          ) : (
            <form action={handleSubmit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="email">
                <IconInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  icon={<MailIcon size={16} />}
                  placeholder="tú@email.com"
                  required
                />
              </Field>

              {error ? <p className="text-sm text-coral">{error}</p> : null}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate">
            <Link to="/login" className="font-semibold text-azure">
              Volver a iniciar sesión
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
