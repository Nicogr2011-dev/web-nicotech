import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { computeNextChargeDate } from "@/lib/subscriptions";
import { Button } from "@/components/ui/Button";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { SubscriptionModal } from "@/components/dashboard/SubscriptionModal";
import { SubscriptionForm } from "@/components/dashboard/SubscriptionForm";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { SubscriptionView } from "./types";

type RawSubscription = Omit<SubscriptionView, "nextChargeDate">;

function withComputedFields(raw: RawSubscription[]): SubscriptionView[] {
  return raw.map((s) => ({
    ...s,
    nextChargeDate: computeNextChargeDate(new Date(s.startDate)).toISOString(),
  }));
}

function formDataToPayload(formData: FormData) {
  return {
    serviceName: String(formData.get("serviceName") ?? ""),
    price: Number(formData.get("price")),
    currency: String(formData.get("currency") ?? "EUR"),
    startDate: String(formData.get("startDate") ?? ""),
    cancelDate: formData.get("cancelDate") ? String(formData.get("cancelDate")) : null,
    accentColor: String(formData.get("accentColor") ?? ""),
  };
}

export function SubscriptionsSection() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionView[] | null>(null);
  const [modal, setModal] = useState<null | "add" | { edit: SubscriptionView }>(null);

  const load = useCallback(async () => {
    const data = await apiGet<{ subscriptions: RawSubscription[] }>("/subscriptions/list.php");
    setSubscriptions(withComputedFields(data.subscriptions));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(formData: FormData) {
    await apiPost("/subscriptions/create.php", formDataToPayload(formData));
    setModal(null);
    await load();
  }

  async function handleEdit(id: string, formData: FormData) {
    await apiPost("/subscriptions/update.php", { id, ...formDataToPayload(formData) });
    setModal(null);
    await load();
  }

  async function handleDelete(id: string) {
    await apiPost("/subscriptions/delete.php", { id });
    await load();
  }

  async function handleToggle(id: string) {
    await apiPost("/subscriptions/toggle.php", { id });
    await load();
  }

  if (subscriptions === null) {
    return <p className="text-slate">Cargando tus suscripciones…</p>;
  }

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const currency = activeSubs[0]?.currency ?? "EUR";
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + s.price, 0);
  const scheduledCancellations = subscriptions.filter((s) => s.cancelDate).length;

  const nextChargeSub = [...activeSubs].sort(
    (a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime()
  )[0];
  const nextCharge = nextChargeSub
    ? {
        serviceName: nextChargeSub.serviceName,
        date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
          new Date(nextChargeSub.nextChargeDate)
        ),
      }
    : null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);
  const dueTomorrow = activeSubs.filter((s) => s.startDate.slice(0, 10) === tomorrowIso);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Tus suscripciones</h1>
        <Button onClick={() => setModal("add")}>+ Añadir suscripción</Button>
      </div>

      {dueTomorrow.length > 0 ? (
        <div className="rounded-2xl border border-sunflower/40 bg-sunflower/10 px-5 py-4 text-sm text-ink">
          <p className="font-semibold">⏰ Recuerda comprarlas mañana:</p>
          <ul className="mt-1 list-disc pl-5">
            {dueTomorrow.map((s) => (
              <li key={s.id}>{s.serviceName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <SummaryStats
        monthlyTotal={monthlyTotal}
        currency={currency}
        nextCharge={nextCharge}
        scheduledCancellations={scheduledCancellations}
      />

      {subscriptions.length === 0 ? (
        <EmptyState onAdd={() => setModal("add")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={() => setModal({ edit: subscription })}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {modal === "add" ? (
        <SubscriptionModal title="Añadir suscripción" onClose={() => setModal(null)}>
          <SubscriptionForm onSubmit={handleAdd} onCancel={() => setModal(null)} />
        </SubscriptionModal>
      ) : null}

      {modal && typeof modal === "object" ? (
        <SubscriptionModal title="Editar suscripción" onClose={() => setModal(null)}>
          <SubscriptionForm
            subscription={modal.edit}
            onSubmit={(formData) => handleEdit(modal.edit.id, formData)}
            onCancel={() => setModal(null)}
          />
        </SubscriptionModal>
      ) : null}
    </div>
  );
}
