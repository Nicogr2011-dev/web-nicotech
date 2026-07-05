import { useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth, type AuthUser } from "@/lib/AuthContext";

const TIER_SWITCH_ALLOWED_EMAIL = "nicolas.grana.miguez@gmail.com";

type Plan = {
  id: AuthUser["tier"];
  name: string;
  accent: string;
  tagline: string;
  price: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "BASICO",
    name: "Básico",
    accent: "#2ec4b6",
    tagline: "Para empezar a organizarte",
    price: "Gratis",
    features: ["Todas las funciones de Nicotech", "Con publicidad", "Hasta 20 suscripciones a la vez"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    accent: "#8338ec",
    tagline: "Sin publicidad, sin límites",
    price: "Próximamente",
    features: ["Todas las funciones de Nicotech", "Sin publicidad", "Suscripciones ilimitadas"],
  },
  {
    id: "PREMIUM_LITE",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "Sin límites, con publicidad",
    price: "Próximamente",
    features: ["Todas las funciones de Nicotech", "Con publicidad", "Suscripciones ilimitadas"],
  },
];

export default function PricingPage() {
  const { user, setTier } = useAuth();
  const [pendingId, setPendingId] = useState<AuthUser["tier"] | null>(null);
  const [errorId, setErrorId] = useState<AuthUser["tier"] | null>(null);
  const [codeErrorId, setCodeErrorId] = useState<AuthUser["tier"] | null>(null);
  const [codeInputs, setCodeInputs] = useState<Partial<Record<AuthUser["tier"], string>>>({});

  async function handleTierChange(planId: AuthUser["tier"], code?: string) {
    setPendingId(planId);
    setErrorId(null);
    setCodeErrorId(null);
    const { error } = await setTier(planId, code);
    setPendingId(null);
    if (error) {
      if (code) setCodeErrorId(planId);
      else setErrorId(planId);
    }
  }

  const canSwitch = user?.email.toLowerCase() === TIER_SWITCH_ALLOWED_EMAIL;

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Precios</h1>
          <p className="mt-3 text-slate">
            Nicotech es y seguirá siendo gratis. Estamos preparando planes de pago opcionales para quien quiera
            quitarse la publicidad o pasar del límite de 20 suscripciones — de momento, mientras no hay pasarela de
            pago real, se desbloquean con un código de acceso.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = user?.tier === plan.id;
            const isPending = pendingId === plan.id;

            return (
              <Card key={plan.id} className="flex flex-col p-6">
                <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: plan.accent }} />
                <h2 className="mt-4 font-display text-xl font-extrabold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate">{plan.tagline}</p>
                <p className="mt-4 font-display text-2xl font-extrabold text-ink">{plan.price}</p>

                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold" style={{ color: plan.accent }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {!user ? (
                    <ButtonLink href="/register" variant="secondary" className="w-full">
                      Crea tu cuenta gratis
                    </ButtonLink>
                  ) : isCurrent ? (
                    <div className="rounded-full bg-ink/5 px-5 py-3 text-center text-sm font-semibold text-ink">
                      Tu plan actual
                    </div>
                  ) : canSwitch || plan.id === "BASICO" ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={isPending}
                      onClick={() => handleTierChange(plan.id)}
                    >
                      {isPending ? "Cambiando…" : "Cambiar a este plan"}
                    </Button>
                  ) : (
                    <div className="rounded-2xl border border-black/10 p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate/70">Pago</p>
                      <p className="mt-1 text-xs text-slate">
                        De momento el único método de pago es un código de acceso.
                      </p>
                      <input
                        type="text"
                        value={codeInputs[plan.id] ?? ""}
                        onChange={(e) =>
                          setCodeInputs((prev) => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        placeholder="Código de acceso"
                        className="mt-3 w-full rounded-full border border-black/10 px-4 py-2 text-sm text-ink focus:border-azure focus:outline-none"
                      />
                      <Button
                        variant="secondary"
                        className="mt-2 w-full"
                        disabled={isPending || !(codeInputs[plan.id] ?? "").trim()}
                        onClick={() => handleTierChange(plan.id, codeInputs[plan.id])}
                      >
                        {isPending ? "Comprobando…" : "Canjear código"}
                      </Button>
                      {codeErrorId === plan.id ? (
                        <p className="mt-2 text-xs text-coral">Código no válido.</p>
                      ) : null}
                    </div>
                  )}
                </div>

                {errorId === plan.id ? (
                  <p className="mt-2 text-center text-xs text-coral">No se pudo cambiar de plan. Inténtalo de nuevo.</p>
                ) : null}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
