"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerUser, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initialState);
  const credentialsRef = useRef({ email: "", password: "" });

  useEffect(() => {
    if (!state.success) return;
    const { email, password } = credentialsRef.current;
    if (!email || !password) return;

    signIn("credentials", { email, password, redirect: false }).then((res) => {
      if (res?.ok) router.push("/dashboard");
      else router.push("/login");
    });
  }, [state.success, router]);

  return (
    <Card className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-slate">Organiza tus suscripciones en minutos.</p>

      <form
        id="register-form"
        action={formAction}
        onSubmit={(e) => {
          const form = e.currentTarget;
          credentialsRef.current = {
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value,
          };
        }}
        className="mt-6 space-y-4"
      >
        <Field label="Nombre" htmlFor="name">
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Contraseña" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>

        {state.error ? <p className="text-sm text-coral">{state.error}</p> : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-azure">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
