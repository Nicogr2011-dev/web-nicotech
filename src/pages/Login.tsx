import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useRecaptchaBadge } from "@/lib/useRecaptchaBadge";
import { Card } from "@/components/ui/Card";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
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
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

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

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    setForgotMessage("Muy pronto podrás recuperar tu contraseña desde aquí.");
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

        <Card
          className="p-8"
          style={{ animation: shake ? "shake-error 0.4s ease-in-out" : "card-in 0.35s ease-out" }}
        >
          <h1 className="text-center font-display text-xl font-extrabold text-ink">Inicia sesión</h1>
          <p className="mt-1.5 text-center text-sm text-slate">Accede a tu área de cliente.</p>

          <div className="mt-6">
            <SocialLoginButtons
              disabled={pending}
              onGoogleClick={() => handleSocial(loginWithGoogle)}
              onAppleClick={() => handleSocial(loginWithApple)}
            />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/8" />
            <span className="text-xs font-semibold text-slate">o con email</span>
            <div className="h-px flex-1 bg-black/8" />
          </div>

          <form action={handleSubmit} className="space-y-4">
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
                <label htmlFor="password" className="text-sm font-semibold text-ink">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-azure hover:underline"
                >
                  ¿La olvidaste?
                </button>
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
                    className="flex text-slate"
                  >
                    {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                  </button>
                }
                required
              />
            </div>

            <label className="flex select-none items-center gap-2 text-sm text-slate">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-azure"
              />
              Mantener sesión iniciada
            </label>

            {forgotMessage ? <p className="text-sm text-slate">{forgotMessage}</p> : null}
            {error ? <p className="text-sm text-coral">{error}</p> : null}
            {success ? <p className="text-sm text-mint">{success}</p> : null}

            <Button type="submit" disabled={pending} className="w-full" style={sweeping ? SWEEP_STYLE : undefined}>
              {pending ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-azure">
              Regístrate
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
