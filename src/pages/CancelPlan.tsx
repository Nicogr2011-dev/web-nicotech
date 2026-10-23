import { useEffect, useState } from "react";
import { addMonths } from "date-fns";
import { Link, Navigate } from "react-router-dom";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";
import { PLANS, LIMIT_GRACE_MONTHS } from "@/lib/pricingPlans";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

export default function CancelPlanPage() {
  const { user, cancelPlan } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lo que había antes de confirmar: tras la baja, user.plan puede pasar a null.
  const [done, setDone] = useState<{ planName: string; endsAt: string | null; graceEndsAt: Date } | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ subscriptions: { status: string; deletedAt: string | null }[] }>("/subscriptions/list.php")
      .then(({ subscriptions }) =>
        setActiveCount(subscriptions.filter((s) => s.status === "ACTIVE" && !s.deletedAt).length)
      )
      .catch(() => setActiveCount(null));
  }, []);

  const plan = PLANS.find((p) => p.id === user?.tier);
  const billing = user?.plan;
  const basicLimit = PLANS.find((p) => p.id === "BASICO")?.subscriptionLimit ?? 3;
  const excess = activeCount !== null ? activeCount - basicLimit : 0;
  // El plazo empieza al pasar a Básico: al final del periodo pagado, o ya mismo si el plan era de código.
  const downgradeDate = billing?.viaStripe && billing.renewsAt ? new Date(billing.renewsAt) : new Date();
  const graceEndsAt = addMonths(downgradeDate, LIMIT_GRACE_MONTHS);

  if (!done && (!plan || !billing || billing.endsAt)) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleConfirm() {
    if (!plan) return;
    setPending(true);
    setError(null);
    const { error: err } = await cancelPlan();
    setPending(false);
    if (err) {
      setError(err);
      return;
    }
    setDone({ planName: plan.name, endsAt: billing?.viaStripe ? (billing.renewsAt ?? null) : null, graceEndsAt });
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 sm:px-6">
        {done ? (
          <div className="text-center" style={{ animation: "card-in 0.35s ease-out" }}>
            <h1 className="font-display text-2xl font-extrabold text-body">Te has dado de baja</h1>
            <p className="mt-3 text-muted">
              {done.endsAt
                ? `No te volveremos a cobrar. Sigues teniendo ${done.planName} hasta el ${dateFormatter.format(new Date(done.endsAt))}; después pasarás al plan Básico.`
                : "Ya estás en el plan Básico."}
            </p>
            {excess > 0 ? (
              <p className="mt-3 text-muted">
                Tienes hasta el {dateFormatter.format(done.graceEndsAt)} para volver a un plan de pago; si no,
                cancelaremos {excess === 1 ? "tu suscripción más reciente" : `tus ${excess} suscripciones más recientes`}.
              </p>
            ) : null}
            <ButtonLink href="/dashboard" className="mt-6">
              Volver a mis suscripciones
            </ButtonLink>
          </div>
        ) : plan && billing ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-muted hover:text-body">
              ← Volver a mis suscripciones
            </Link>

            <h1 className="mt-4 font-display text-2xl font-extrabold text-body">Darte de baja de {plan.name}</h1>
            <p className="mt-2 text-muted">Antes de confirmar, esto es lo que va a pasar:</p>

            <Card className="mt-8 space-y-4 p-6" style={{ animation: "card-in 0.35s ease-out" }}>
              <ul className="space-y-3 text-sm text-body">
                {billing.viaStripe ? (
                  <>
                    <li>• Dejaremos de cobrarte: no habrá más renovaciones.</li>
                    <li>
                      • Conservas {plan.name} hasta el{" "}
                      <span className="font-semibold">
                        {billing.renewsAt ? dateFormatter.format(new Date(billing.renewsAt)) : "final del periodo pagado"}
                      </span>
                      , que es lo que ya has pagado.
                    </li>
                  </>
                ) : (
                  <li>• Pasarás al plan Básico ahora mismo (tu plan se activó con un código, no hay nada que cobrar).</li>
                )}
                {excess > 0 ? (
                  <li>
                    • Tienes {activeCount} suscripciones activas y Básico permite {basicLimit}. Tendrás{" "}
                    {LIMIT_GRACE_MONTHS} meses desde que pases a Básico, hasta el{" "}
                    <span className="font-semibold">{dateFormatter.format(graceEndsAt)}</span>, para volver a un plan de
                    pago. Si no, cancelaremos {excess === 1 ? "la más reciente" : `las ${excess} más recientes`}.
                  </li>
                ) : (
                  <li>• En Básico puedes tener hasta {basicLimit} suscripciones a la vez.</li>
                )}
                <li>• Puedes volver a un plan de pago cuando quieras desde Precios.</li>
              </ul>

              {error ? <p className="text-sm text-coral">{error}</p> : null}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse">
                <ButtonLink href="/dashboard" className="flex-1">
                  Mantener mi plan
                </ButtonLink>
                <Button variant="ghost" className="flex-1 text-coral" disabled={pending} onClick={handleConfirm}>
                  {pending ? "Dando de baja…" : "Confirmar baja"}
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
