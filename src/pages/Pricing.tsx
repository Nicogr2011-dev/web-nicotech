import { clsx } from "clsx";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { PLANS } from "@/lib/pricingPlans";

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-body sm:text-4xl">Precios</h1>
          <p className="mt-3 text-muted">
            Nicotech es gratis, sin publicidad y con todas las suscripciones que quieras. Los planes de pago no están
            disponibles por ahora.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = user?.tier === plan.id;

            return (
              <Card key={plan.id} className={clsx("flex flex-col p-6", !plan.available && !isCurrent && "opacity-60")}>
                <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: plan.accent }} />
                <h2 className="mt-4 font-display text-xl font-extrabold text-body">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

                {plan.available ? (
                  <p className="mt-4 font-display text-2xl font-extrabold text-body">Gratis</p>
                ) : null}

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
                  {isCurrent ? (
                    <div className="rounded-full bg-body/5 px-5 py-3 text-center text-sm font-semibold text-body">
                      Tu plan actual
                    </div>
                  ) : !plan.available ? (
                    <div className="rounded-full bg-body/5 px-5 py-3 text-center text-sm font-semibold text-muted">
                      No disponible
                    </div>
                  ) : !user ? (
                    <ButtonLink href="/register" variant="secondary" className="w-full">
                      Crea tu cuenta gratis
                    </ButtonLink>
                  ) : user.plan?.endsAt ? (
                    <div className="rounded-full bg-body/5 px-5 py-3 text-center text-sm font-semibold text-muted">
                      Baja ya programada
                    </div>
                  ) : (
                    // Quien aún tiene un plan de pago pasa a Básico dándose de baja: hay que
                    // cancelar el cobro en Stripe.
                    <ButtonLink href="/cancelar-plan" variant="secondary" className="w-full">
                      Cambiar a este plan
                    </ButtonLink>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
