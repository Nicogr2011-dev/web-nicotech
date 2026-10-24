import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clsx } from "clsx";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/Confetti";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { getPlanBySlug, formatPrice } from "@/lib/pricingPlans";

type Interval = "year" | "month";

/** Stripe devuelve aquí al usuario con ?stripe_session=cs_... antes del # (ver api/billing/create-checkout.php). */
function readReturnedSession(): string | null {
  return new URLSearchParams(window.location.search).get("stripe_session");
}

export default function CheckoutPage() {
  const { tier: slug } = useParams<{ tier: string }>();
  const { user, setTier, confirmCheckout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<{ cardEnabled: boolean; testMode: boolean } | null>(null);
  // Precios enlaza con ?ciclo=mensual|anual según lo que eligió allí; antes se abría
  // siempre en anual y quien quería mensual acababa pagando el año.
  const [searchParams] = useSearchParams();
  const [interval, setBillingInterval] = useState<Interval>(searchParams.get("ciclo") === "mensual" ? "month" : "year");
  const [cardPending, setCardPending] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [returnedSession] = useState(readReturnedSession);
  const [confirming, setConfirming] = useState(Boolean(returnedSession));
  const [confirmed, setConfirmed] = useState(false);
  const confirmStarted = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const plan = getPlanBySlug(slug);

  useEffect(() => {
    apiGet<{ cardEnabled: boolean; testMode: boolean }>("/billing/config.php")
      .then(setBilling)
      .catch(() => setBilling({ cardEnabled: false, testMode: false }));
  }, []);

  useEffect(() => {
    // StrictMode monta el efecto dos veces en desarrollo: confirmar una sola vez.
    if (!returnedSession || confirmStarted.current) return;
    confirmStarted.current = true;
    // Quita ?stripe_session de la URL para que recargar no repita la comprobación.
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
    confirmCheckout(returnedSession).then(({ error: err }) => {
      if (err) setCardError(err);
      else {
        setConfirmed(true);
        setShowConfetti(true);
      }
      setConfirming(false);
    });
    // confirmCheckout cambia en cada render del provider; solo hay que confirmar una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedSession]);

  if (confirming || confirmed) {
    return (
      <div className="flex min-h-screen flex-col bg-page">
        {showConfetti ? <Confetti onDone={() => setShowConfetti(false)} /> : null}
        <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center sm:px-6">
          {confirming ? (
            <p className="text-muted">Comprobando tu pago…</p>
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold text-body">¡Ya eres {plan?.name ?? "Premium"}!</h1>
              <p className="mt-2 text-muted">Pago completado. Tu plan ya está activo.</p>
              <Button className="mt-6" onClick={() => navigate("/dashboard")}>
                Ir a mis suscripciones
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }

  if (!plan || plan.id === "BASICO" || user?.tier === plan.id) {
    return <Navigate to="/precios" replace />;
  }

  async function handleRedeem() {
    if (!plan || !code.trim()) return;
    setPending(true);
    setError(null);
    const { error: err } = await setTier(plan.id, code);
    setPending(false);
    if (err) {
      setError("Código no válido.");
      return;
    }
    navigate("/precios");
  }

  async function handleCard() {
    if (!plan) return;
    setCardPending(true);
    setCardError(null);
    try {
      const { url } = await apiPost<{ url: string }>("/billing/create-checkout.php", {
        tier: plan.id,
        slug: plan.slug,
        interval,
      });
      window.location.href = url;
    } catch (err) {
      setCardPending(false);
      setCardError(err instanceof ApiError ? err.message : "No se pudo iniciar el pago");
    }
  }

  const intervals: { id: Interval; label: string; price: number | null }[] = [
    { id: "year", label: "Anual", price: plan.priceYearly },
    { id: "month", label: "Mensual", price: plan.priceMonthly },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteNav authed={Boolean(user)} userName={user?.name ?? user?.email} tier={user?.tier} avatarUrl={user?.avatarUrl} />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 sm:px-6">
        <Link to="/precios" className="text-sm font-medium text-muted hover:text-body">
          ← Volver a precios
        </Link>

        <h1 className="mt-4 font-display text-2xl font-extrabold text-body">Suscripción a {plan.name}</h1>
        <p className="mt-2 text-muted">
          {plan.priceYearly !== null ? `${formatPrice(plan.priceYearly)}/año` : ""}
          {plan.priceMonthly !== null ? ` · o ${formatPrice(plan.priceMonthly)}/mes` : ""}
        </p>

        {billing?.testMode ? (
          <div className="mt-6 rounded-xl border border-sunflower/40 bg-sunflower/10 px-4 py-3 text-sm text-body">
            <p className="font-semibold">Modo prueba — no se cobra nada</p>
            <p className="mt-1 text-muted">
              Paga con la tarjeta <span className="font-mono text-body">4242 4242 4242 4242</span>, cualquier fecha
              futura y cualquier CVC.
            </p>
          </div>
        ) : null}

        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg font-bold text-body">Método de pago</h2>

          <div className="mt-4 space-y-3">
            {billing?.cardEnabled ? (
              <div className="rounded-xl border-2 border-azure bg-azure/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-body">Tarjeta de crédito/débito</span>
                  <span className="text-xs font-semibold text-azure">Vía Stripe</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {intervals.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBillingInterval(opt.id)}
                      className={clsx(
                        "rounded-xl border px-3 py-2 text-left transition-colors",
                        interval === opt.id ? "border-azure bg-surface" : "border-hairline hover:bg-surface"
                      )}
                    >
                      <span className="block text-xs font-semibold text-muted">{opt.label}</span>
                      <span className="block text-sm font-bold text-body">
                        {opt.price !== null ? formatPrice(opt.price) : "—"}
                        <span className="font-normal text-muted">{opt.id === "year" ? "/año" : "/mes"}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <Button className="mt-3 w-full" disabled={cardPending} onClick={handleCard}>
                  {cardPending ? "Abriendo pago seguro…" : "Pagar con tarjeta"}
                </Button>
                {cardError ? <p className="mt-2 text-xs text-coral">{cardError}</p> : null}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 opacity-50">
                <span className="text-sm font-medium text-body">Tarjeta de crédito/débito</span>
                <span className="text-xs text-muted">Próximamente</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 opacity-50">
              <span className="text-sm font-medium text-body">PayPal</span>
              <span className="text-xs text-muted">Próximamente</span>
            </div>

            <div className="rounded-xl border border-hairline px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-body">Código de acceso</span>
                <span className="text-xs font-semibold text-muted">Disponible</span>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código de acceso"
                className="mt-3 w-full rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-body focus:border-azure focus:outline-none"
              />
              <Button className="mt-3 w-full" disabled={pending || !code.trim()} onClick={handleRedeem}>
                {pending ? "Comprobando…" : "Activar con código"}
              </Button>
              {error ? <p className="mt-2 text-xs text-coral">{error}</p> : null}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
