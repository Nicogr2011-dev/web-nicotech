import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { findCatalogServiceByName, getManageUrl } from "@/lib/serviceCatalog";
import type { SubscriptionView } from "./types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggle,
}: {
  subscription: SubscriptionView;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const todayIso = new Date().toISOString().slice(0, 10);
  const isPendingPurchase = subscription.status === "ACTIVE" && subscription.startDate.slice(0, 10) > todayIso;

  async function handleDelete() {
    if (!confirm(`¿Eliminar la suscripción a ${subscription.serviceName}?`)) return;
    setIsSaving(true);
    await onDelete(subscription.id);
    setIsSaving(false);
  }

  async function handleToggle() {
    if (subscription.status === "ACTIVE") {
      const catalogService = findCatalogServiceByName(subscription.serviceName);
      if (catalogService) {
        window.open(getManageUrl(catalogService), "_blank", "noopener,noreferrer");
      }
    }
    setIsSaving(true);
    await onToggle(subscription.id);
    setIsSaving(false);
  }

  function handleCancelHoverStart() {
    cardRef.current?.classList.add("animate-scared-shake");
  }

  function handleCancelHoverEnd() {
    cardRef.current?.classList.remove("animate-scared-shake");
  }

  return (
    <Card
      ref={cardRef}
      className="flex flex-col gap-3 border-l-4 p-5 transition-transform hover:-translate-y-1"
      style={{ borderLeftColor: subscription.accentColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-ink">{subscription.serviceName}</h3>
          <p className="text-lg font-semibold text-ink">
            {subscription.price.toLocaleString("es-ES", { style: "currency", currency: subscription.currency })}
            <span className="text-sm font-normal text-slate">/mes</span>
          </p>
        </div>
        <Badge tone={isPendingPurchase ? "pending" : subscription.status === "ACTIVE" ? "active" : "cancelled"}>
          {isPendingPurchase ? "Pendiente" : subscription.status === "ACTIVE" ? "Activa" : "Cancelada"}
        </Badge>
      </div>

      <div className="space-y-1 text-sm text-slate">
        <p>Cobra el día {new Date(subscription.startDate).getDate()}</p>
        <p>Próximo cobro: {formatDate(subscription.nextChargeDate)}</p>
      </div>

      {subscription.cancelDate ? (
        <Badge tone="scheduled">Se cancela el {formatDate(subscription.cancelDate)}</Badge>
      ) : null}

      <div className="mt-2 flex gap-2 border-t border-black/5 pt-3 text-sm font-semibold">
        <button onClick={onEdit} className="text-azure hover:underline" disabled={isSaving}>
          Editar
        </button>
        <button
          onClick={handleToggle}
          onMouseEnter={subscription.status === "ACTIVE" ? handleCancelHoverStart : undefined}
          onMouseLeave={subscription.status === "ACTIVE" ? handleCancelHoverEnd : undefined}
          className="text-slate hover:underline"
          disabled={isSaving}
        >
          {subscription.status === "ACTIVE" ? "Cancelar" : "Reactivar"}
        </button>
        <button onClick={handleDelete} className="ml-auto text-coral hover:underline" disabled={isSaving}>
          Eliminar
        </button>
      </div>
    </Card>
  );
}
