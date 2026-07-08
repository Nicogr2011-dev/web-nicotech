import { useState } from "react";
import { clsx } from "clsx";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth, type AuthUser } from "@/lib/AuthContext";
import { PLANS, formatPrice, getYearlySavingsPercent } from "@/lib/pricingPlans";
import { ADMIN_EMAIL } from "@/lib/admin";

const MAX_SAVINGS_PERCENT = Math.max(...PLANS.map((plan) => getYearlySavingsPercent(plan) ?? 0));

export default function PricingPage() {
  const { user, setTier } = useAuth();
  const [pendingId, setPendingId] = useState<AuthUser["tier"] | null>(null);
  const [errorId, setErrorId] = useState<AuthUser["tier"] | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  async function handleTierChange(planId: AuthUser["tier"]) {
    setPendingId(planId);
    setErrorId(null);
    const { error } = await setTier(planId);
    setPendingId(null);
    if (error) setErrorId(planId);
  }

  const canSwitch = user?.email.toLowerCase() === ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-body sm:text-4xl">Precios</h1>
          <p className="mt-3 text-muted">
            Nicotech es y seguirá siendo gratis en su plan Básico, sin publicidad en ningún plan. Premium y Premium
            Lite amplían el límite de suscripciones — al elegirlos te llevamos a una página de pago con los métodos
            disponibles.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full bg-surface p-1 shadow-soft">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              billingCycle === "monthly" ? "bg-ink text-white" : "text-muted hover:text-body"
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={clsx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              billingCycle === "yearly" ? "bg-ink text-white" : "text-muted hover:text-body"
            )}
          >
            Anual
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                billingCycle === "yearly" ? "bg-mint text-ink" : "bg-mint/20 text-mint"
              )}
            >
              Ahorra hasta {MAX_SAVINGS_PERCENT}%
            </span>
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = user?.tier === plan.id;
            const isPending = pendingId === plan.id;
            const canInstantSwitch = canSwitch || plan.id === "BASICO";
            const savings = getYearlySavingsPercent(plan);

            return (
              <Card key={plan.id} className="flex flex-col p-6">
                <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: plan.accent }} />
                <h2 className="mt-4 font-display text-xl font-extrabold text-body">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

                {plan.priceYearly === null ? (
                  <p className="mt-4 font-display text-2xl font-extrabold text-body">Gratis</p>
                ) : billingCycle === "yearly" ? (
                  <>
                    <p className="mt-4 font-display text-2xl font-extrabold text-body">
                      {formatPrice(plan.priceYearly)}/año
                    </p>
                    <p className="text-xs text-muted">
                      Equivale a {formatPrice(plan.priceYearly / 12)}/mes
                      {savings ? <span className="ml-1 font-semibold text-mint">· ahorras {savings}%</span> : null}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 font-display text-2xl font-extrabold text-body">
                      {formatPrice(plan.priceMonthly!)}/mes
                    </p>
                    {savings ? (
                      <p className="text-xs text-muted">
                        O paga anual y{" "}
                        <button
                          type="button"
                          onClick={() => setBillingCycle("yearly")}
                          className="font-semibold text-mint underline-offset-2 hover:underline"
                        >
                          ahorra {savings}%
                        </button>
                      </p>
                    ) : null}
                  </>
                )}

                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
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
                    <div className="rounded-full bg-body/5 px-5 py-3 text-center text-sm font-semibold text-body">
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

        <hr className="mx-auto mt-16 max-w-2xl border-hairline" />

        <div className="mt-10">
          <Card className="mx-auto max-w-2xl p-6">
            <div className="h-1.5 w-12 rounded-full bg-ink" />
            <h2 className="mt-4 font-display text-xl font-extrabold text-body">Enterprise</h2>
            <p className="mt-1 text-sm text-muted">Para equipos que quieren dar Premium o Premium Lite a sus empleados</p>

            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-body">✓</span>
                20 €/año base sobre Premium, o 18 €/año sobre Premium Lite
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-body">✓</span>
                5 €/año por cada cuenta de empleado en Premium, o 4 €/año en Premium Lite
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-body">✓</span>
                A partir de 4 cuentas, sale más a cuenta que pagarlas por separado
              </li>
            </ul>

            <div className="mt-6">
              <ButtonLink href="/contacto" variant="secondary" className="w-full">
                Contactar
              </ButtonLink>
              <p className="mt-2 text-center text-xs text-muted">
                Este plan no se compra desde la web — escríbenos o llámanos para activarlo.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
