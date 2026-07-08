import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useRecaptchaBadge } from "@/lib/useRecaptchaBadge";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaletteDots } from "@/components/ui/PaletteDots";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { PersonIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icon";

const SWEEP_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, #FF5C5C 0%, #FF5C5C 16.666%, #FFC93C 16.666%, #FFC93C 33.333%, #2EC4B6 33.333%, #2EC4B6 50%, #3A86FF 50%, #3A86FF 66.666%, #8338EC 66.666%, #8338EC 83.333%, #FF6FB5 83.333%, #FF6FB5 100%)",
  backgroundSize: "260% 100%",
  animation: "palette-sweep 1.5s linear",
};

const SHOWCASE = [
  { name: "Netflix", detail: "Streaming · cobra el 4", price: "12,99 €", color: "#ff5c5c" },
  { name: "Spotify", detail: "Música · cobra el 10", price: "9,99 €", color: "#2ec4b6" },
  { name: "Notion", detail: "Software · cobra el 18", price: "8,00 €", color: "#8338ec" },
];

export default function RegisterPage() {
  useRecaptchaBadge();
  const { register, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function onSuccess() {
    setSuccess("Cuenta creada — bienvenido a Nicotech.");
    setTimeout(() => {
      setSweeping(false);
      navigate("/dashboard");
    }, 1900);
  }

  async function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Introduce tu nombre");
      triggerShake();
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Introduce un email válido");
      triggerShake();
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      triggerShake();
      return;
    }

    setPending(true);
    setSweeping(true);

    const result = await register(name, email, password);

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
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 sm:flex">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 15%, rgba(58,134,255,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(131,56,236,0.3), transparent 50%)",
          }}
        />

        <Link to="/" className="relative flex flex-col items-center self-start">
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            Nico<span className="text-[#6fa8ff]">tech</span>
          </span>
          <div className="mt-2.5">
            <PaletteDots size={7} />
          </div>
        </Link>

        <div className="relative flex flex-col gap-4">
          {SHOWCASE.map((card, i) => (
            <div
              key={card.name}
              className="flex max-w-[340px] items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4.5 py-4 backdrop-blur-sm"
              style={{ animation: `float-card 5s ease-in-out ${i * 0.4}s infinite` }}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: card.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{card.name}</p>
                <p className="mt-0.5 text-xs text-white/55">{card.detail}</p>
              </div>
              <span className="text-sm font-bold text-white">{card.price}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          <p className="max-w-[380px] font-display text-2xl font-extrabold leading-tight text-white">
            Todas tus suscripciones, bajo control.
          </p>
          <p className="mt-3 max-w-[340px] text-sm text-white/60">
            Ve tu gasto mensual, agrupa por estado y no vuelvas a pagar por algo que olvidaste cancelar.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-surface px-6 py-12">
        <div
          className="w-full max-w-sm"
          style={{ animation: shake ? "shake-error 0.4s ease-in-out" : "card-in 0.35s ease-out" }}
        >
          <h1 className="font-display text-2xl font-extrabold text-body">Crea tu cuenta</h1>
          <p className="mt-1.5 text-sm text-muted">Organiza tus suscripciones en minutos.</p>

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

          <form action={handleSubmit} className="space-y-4">
            <Field label="Nombre" htmlFor="name">
              <IconInput
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                icon={<PersonIcon size={16} />}
                placeholder="Tu nombre"
                required
              />
            </Field>
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
            <Field label="Contraseña" htmlFor="password">
              <IconInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
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

            {error ? <p className="text-sm text-coral">{error}</p> : null}
            {success ? <p className="text-sm text-mint">{success}</p> : null}

            <Button type="submit" disabled={pending} className="w-full" style={sweeping ? SWEEP_STYLE : undefined}>
              {pending ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-azure">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
