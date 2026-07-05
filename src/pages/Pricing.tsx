import { useState } from "react";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth, type AuthUser } from "@/lib/AuthContext";
import { PLANS } from "@/lib/pricingPlans";

const TIER_SWITCH_ALLOWED_EMAIL = "nicolas.grana.miguez@gmail.com";

export default function PricingPage() {
  const { user, setTier } = useAuth();
  const [pendingId, setPendingId] = useState<AuthUser["tier"] | null>(null);
  const [errorId, setErrorId] = useState<AuthUser["tier"] | null>(null);

  async function handleTierChange(planId: AuthUser["tier"]) {
    setPendingId(planId);
    setErrorId(null);
    const { error } = await setTier(planId);
    setPendingId(null);
    if (error) setErrorId(planId);
  }

  const canSwitch = user?.email.toLowerCase() === TIER_SWITCH_ALLOWED_EMAIL;

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Precios</h1>
          <p className="mt-3 text-slate">
            Nicotech es y seguirá siendo gratis en su plan Básico, sin publicidad en ningún plan. Premium y Premium
            Lite amplían el límite de suscripciones — al elegirlos te llevamos a una página de pago con los métodos
            disponibles.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = user?.tier === plan.id;
            const isPending = pendingId === plan.id;
            const canInstantSwitch = canSwitch || plan.id === "BASICO";

            return (
              <Card key={plan.id} className="flex flex-col p-6">
                <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: plan.accent }} />
                <h2 className="mt-4 font-display text-xl font-extrabold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate">{plan.tagline}</p>
                <p className="mt-4 font-display text-2xl font-extrabold text-ink">{plan.priceYearly}</p>
                {plan.priceMonthly ? <p className="text-xs text-slate">o {plan.priceMonthly}</p> : null}

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
                  ) : canInstantSwitch ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={isPending}
                      onClick={() => handleTierChange(plan.id)}
                    >
                      {isPending ? "Cambiando…" : "Cambiar a este plan"}
                    </Button>
                  ) : (
                    <ButtonLink href={`/pago/${plan.slug}`} variant="secondary" className="w-full">
                      Suscribirme
                    </ButtonLink>
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
