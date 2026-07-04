"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Email o contraseña incorrectos");
    }
  }

  return (
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
        <Link href="/register" className="font-semibold text-azure">
          Regístrate
        </Link>
      </p>
    </Card>
  );
}
