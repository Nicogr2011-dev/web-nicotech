import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await login(String(formData.get("email")), String(formData.get("password")));

    setPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <AuthLayout>
      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold text-ink">Inicia sesión</h1>
        <p className="mt-1 text-sm text-slate">Accede a tu área de cliente.</p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Contraseña" htmlFor="password">
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>

          {error ? <p className="text-sm text-coral">{error}</p> : null}

          <Button type="submit" disabled={pending} className="w-full">
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
    </AuthLayout>
  );
}
