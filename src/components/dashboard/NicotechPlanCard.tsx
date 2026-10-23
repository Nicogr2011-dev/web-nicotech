import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PaletteDots } from "@/components/ui/PaletteDots";
import type { AuthUser } from "@/lib/AuthContext";
import { PLANS, formatPrice } from "@/lib/pricingPlans";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

/**
 * La propia suscripción a Nicotech. No sale de la tabla de suscripciones sino del
 * plan del usuario, así que nunca cuenta para el límite de 3/7 de su plan.
 */
export function NicotechPlanCard({ user }: { user: AuthUser }) {
  const plan = PLANS.find((p) => p.id === user.tier);
  const billing = user.plan;
  if (!plan || !billing) return null;

  const price =
    billing.interval === "year" ? plan.priceYearly : billing.interval === "month" ? plan.priceMonthly : null;

  return (
    <Card className="flex flex-col gap-3 border-l-4 p-5" style={{ borderLeftColor: plan.accent }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-body">Nicotech {plan.name}</h3>
          <p className="text-lg font-semibold text-body">
            {price !== null ? (
              <>
                {formatPrice(price)}
                <span className="text-sm font-normal text-muted">{billing.interval === "year" ? "/año" : "/mes"}</span>
              </>
            ) : (
              <span className="text-sm font-normal text-muted">Activado con código</span>
            )}
          </p>
        </div>
        <PaletteDots size={6} />
      </div>

      <div className="space-y-1 text-sm text-muted">
        {billing.startedAt ? <p>Desde el {dateFormatter.format(new Date(billing.startedAt))}</p> : null}
        {billing.renewsAt && !billing.endsAt ? (
          <p>Se renueva el {dateFormatter.format(new Date(billing.renewsAt))}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="pending" title="Tu plan de Nicotech no ocupa hueco entre tus suscripciones">
          No cuenta en tu límite
        </Badge>
        {billing.endsAt ? (
          <Badge tone="scheduled">Termina el {dateFormatter.format(new Date(billing.endsAt))}</Badge>
        ) : null}
      </div>

      <div className="mt-2 flex gap-2 border-t border-hairline pt-3 text-sm font-semibold">
        <Link to="/precios" className="text-azure hover:underline">
          Cambiar de plan
        </Link>
        {billing.endsAt ? null : (
          <Link to="/cancelar-plan" className="ml-auto text-coral hover:underline">
            Darse de baja
          </Link>
        )}
      </div>
    </Card>
  );
}
