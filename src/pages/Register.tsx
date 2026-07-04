import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await register(
      String(formData.get("name")),
      String(formData.get("email")),
      String(formData.get("password"))
    );

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
        <h1 className="font-display text-2xl font-bold text-ink">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-slate">Organiza tus suscripciones en minutos.</p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <Field label="Nombre" htmlFor="name">
            <Input id="name" name="name" type="text" autoComplete="name" required />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Contraseña" htmlFor="password">
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </Field>

          {error ? <p className="text-sm text-coral">{error}</p> : null}

          <Button type="submit" disabled={pending} className="w-full">
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
