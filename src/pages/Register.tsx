import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";
import { Card } from "@/components/ui/Card";
import { Field, IconInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PersonIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icon";

const SWEEP_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, #FF5C5C 0%, #FF5C5C 16.666%, #FFC93C 16.666%, #FFC93C 33.333%, #2EC4B6 33.333%, #2EC4B6 50%, #3A86FF 50%, #3A86FF 66.666%, #8338EC 66.666%, #8338EC 83.333%, #FF6FB5 83.333%, #FF6FB5 100%)",
  backgroundSize: "260% 100%",
  animation: "palette-sweep 1.5s linear",
};

export default function RegisterPage() {
  const { register } = useAuth();
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

    setSuccess("Cuenta creada — bienvenido a Nicotech.");
    setTimeout(() => {
      setSweeping(false);
      navigate("/dashboard");
    }, 1900);
  }

  return (
    <AuthLayout>
      <Card className="p-8" style={{ animation: shake ? "shake-error 0.4s ease-in-out" : "card-in 0.35s ease-out" }}>
        <h1 className="font-display text-2xl font-bold text-ink">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-slate">Organiza tus suscripciones en minutos.</p>

        <form action={handleSubmit} className="mt-6 space-y-4">
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
                  className="flex text-slate"
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

        <p className="mt-6 text-center text-sm text-slate">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-azure">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
