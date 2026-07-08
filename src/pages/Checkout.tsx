import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { SiteNav } from "@/components/nav/SiteNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { getPlanBySlug, formatPrice } from "@/lib/pricingPlans";

export default function CheckoutPage() {
  const { tier: slug } = useParams<{ tier: string }>();
  const { user, setTier } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = getPlanBySlug(slug);

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

        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg font-bold text-body">Método de pago</h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 opacity-50">
              <span className="text-sm font-medium text-body">Tarjeta de crédito/débito</span>
              <span className="text-xs text-muted">Próximamente</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 opacity-50">
              <span className="text-sm font-medium text-body">PayPal</span>
              <span className="text-xs text-muted">Próximamente</span>
            </div>

            <div className="rounded-xl border-2 border-azure bg-azure/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-body">Código de acceso</span>
                <span className="text-xs font-semibold text-azure">Disponible</span>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código de acceso"
                className="mt-3 w-full rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-body focus:border-azure focus:outline-none"
              />
              <Button className="mt-3 w-full" disabled={pending || !code.trim()} onClick={handleRedeem}>
                {pending ? "Comprobando…" : "Pagar y activar plan"}
              </Button>
              {error ? <p className="mt-2 text-xs text-coral">{error}</p> : null}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
