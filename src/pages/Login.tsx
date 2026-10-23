import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useRecaptchaBadge } from "@/lib/useRecaptchaBadge";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icon";

const SWEEP_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, #FF5C5C 0%, #FF5C5C 16.666%, #FFC93C 16.666%, #FFC93C 33.333%, #2EC4B6 33.333%, #2EC4B6 50%, #3A86FF 50%, #3A86FF 66.666%, #8338EC 66.666%, #8338EC 83.333%, #FF6FB5 83.333%, #FF6FB5 100%)",
  backgroundSize: "260% 100%",
  animation: "palette-sweep 1.5s linear",
};

export default function LoginPage() {
  useRecaptchaBadge();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function onSuccess() {
    setSuccess("Sesión iniciada — bienvenido de nuevo.");
    setTimeout(() => {
      setSweeping(false);
      navigate("/dashboard");
    }, 1900);
  }

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError("Introduce tu email y contraseña");
      triggerShake();
      return;
    }

    setPending(true);
    setSweeping(true);

    const result = await login(email, password, remember);

    if (result.error) {
      setPending(false);
      setSweeping(false);
      setError(result.error);
      triggerShake();
      return;
    }

    onSuccess();
  }

  async function handleSocial(fn: () => Promise<{ error?: string }>) {
    setError(null);
    setSuccess(null);
    setPending(true);
    setSweeping(true);

    const result = await fn();

    if (result.error) {
      setPending(false);
      setSweeping(false);
      setError(result.error);
      triggerShake();
      return;
    }

    onSuccess();
  }

  return (
    <div className="grid min-h-screen sm:grid-cols-2">
      <AuthSidePanel
        title="Bienvenido de nuevo."
        subtitle="Tus suscripciones te esperan justo donde las dejaste: gasto del mes, próximos cobros y cancelaciones programadas."
      />

      <div className="flex items-center justify-center bg-surface px-6 py-12">
        <div
          className="w-full max-w-sm"
          style={{ animation: shake ? "shake-error 0.4s ease-in-out" : "card-in 0.35s ease-out" }}
        >
          <h1 className="font-display text-2xl font-extrabold text-body">Inicia sesión</h1>
          <p className="mt-1.5 text-sm text-muted">Accede a tu área de cliente.</p>

          <div className="mt-6">
            <SocialLoginButtons
              disabled={pending}
              onGoogleClick={() => handleSocial(loginWithGoogle)}
              onAppleClick={() => handleSocial(loginWithApple)}
            />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-xs font-semibold text-muted">o con email</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <form
            // onSubmit y no action: React 19 vacía los formularios con action al terminar,
            // y tras un error obligaría a reescribir el email.
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
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
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-body">
                  Contraseña
                </label>
                <Link to="/recuperar" className="text-xs font-semibold text-azure hover:underline">
                  ¿La olvidaste?
                </Link>
              </div>
              <IconInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                icon={<LockIcon size={16} />}
                placeholder="Tu contraseña"
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
            </div>

            <label className="flex select-none items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-azure"
              />
              Mantener sesión iniciada
            </label>

            {error ? <p className="text-sm text-coral">{error}</p> : null}
            {success ? <p className="text-sm text-mint">{success}</p> : null}

            <Button type="submit" disabled={pending} className="w-full" style={sweeping ? SWEEP_STYLE : undefined}>
              {pending ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-azure">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
