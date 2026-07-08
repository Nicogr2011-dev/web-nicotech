import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/Card";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icon";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setPending(true);
    const result = await resetPassword(token, password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#eef2ff_0%,#f7f8fa_45%,#fef6ea_100%)] px-4 py-12 dark:bg-[linear-gradient(160deg,#141726_0%,#0a0c10_45%,#171310_100%)]">
      <div className="w-full max-w-[400px]">
        <div className="mb-5 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold text-body">
            Nico<span className="text-azure">tech</span>
          </Link>
          <div className="mt-2.5 flex justify-center">
            <PaletteDots size={7} />
          </div>
        </div>

        <Card className="p-8" style={{ animation: "card-in 0.35s ease-out" }}>
          <h1 className="text-center font-display text-xl font-extrabold text-body">Restablece tu contraseña</h1>

          {!token ? (
            <p className="mt-6 text-center text-sm text-coral">
              Este enlace no es válido. Pide uno nuevo desde{" "}
              <Link to="/recuperar" className="font-semibold text-azure">
                recuperar contraseña
              </Link>
              .
            </p>
          ) : success ? (
            <p className="mt-6 text-center text-sm text-mint">
              Contraseña actualizada. Redirigiendo al inicio de sesión…
            </p>
          ) : (
            <form action={handleSubmit} className="mt-6 space-y-4">
              <Field label="Nueva contraseña" htmlFor="password">
                <IconInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  icon={<LockIcon size={16} />}
                  placeholder="Mínimo 8 caracteres"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="flex text-muted"
                    >
                      {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                    </button>
                  }
                  required
                />
              </Field>
              <Field label="Confirma la contraseña" htmlFor="confirmPassword">
                <IconInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  icon={<LockIcon size={16} />}
                  placeholder="Repite la contraseña"
                  required
                />
              </Field>

              {error ? <p className="text-sm text-coral">{error}</p> : null}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Guardando…" : "Guardar contraseña"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
