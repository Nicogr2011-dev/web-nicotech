import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { apiGet, apiPost } from "@/lib/api";
import { computeNextChargeDate, isPendingPurchase } from "@/lib/subscriptions";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ClockIcon } from "@/components/ui/Icon";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { MonthlySpendChart } from "@/components/dashboard/MonthlySpendChart";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";
import { ExpandableSubscriptionCard } from "@/components/dashboard/ExpandableSubscriptionCard";
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

function SectionHeader({ dotColor, title, count }: { dotColor: string; title: string; count: number }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
      <span className="rounded-full bg-slate/10 px-2.5 py-0.5 text-xs font-bold text-slate">{count}</span>
    </div>
  );
}

export function SubscriptionsSection() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionView[] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [partying, setPartying] = useState(false);

  useEffect(() => {
    function handleParty() {
      setPartying(true);
      window.setTimeout(() => setPartying(false), 900);
    }
    window.addEventListener("nicotech:party", handleParty);
    return () => window.removeEventListener("nicotech:party", handleParty);
  }, []);

  const load = useCallback(async () => {
    const data = await apiGet<{ subscriptions: RawSubscription[] }>("/subscriptions/list.php");
    setSubscriptions(withComputedFields(data.subscriptions));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(formData: FormData) {
    await apiPost("/subscriptions/create.php", formDataToPayload(formData));
    setShowAddModal(false);
    await load();
  }

  async function handleEdit(id: string, formData: FormData) {
    await apiPost("/subscriptions/update.php", { id, ...formDataToPayload(formData) });
    setEditingId(null);
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

  // Las eliminadas (deletedAt) se quedan fuera de todo lo "visible" — pero se siguen
  // mandando a las gráficas (subscriptions, sin filtrar) para que el gasto de los
  // meses en los que sí estuvieron activas no desaparezca del histórico.
  const visibleSubscriptions = subscriptions.filter((s) => !s.deletedAt);

  const activeSubs = visibleSubscriptions.filter((s) => s.status === "ACTIVE" && !isPendingPurchase(s));
  const pendingSubs = visibleSubscriptions.filter((s) => isPendingPurchase(s));
  const cancelledSubs = visibleSubscriptions.filter((s) => s.status === "CANCELLED");
  const currency = visibleSubscriptions[0]?.currency ?? "EUR";
  const scheduledCancellations = visibleSubscriptions.filter((s) => s.cancelDate).length;

  const nextChargeSub = [...activeSubs, ...pendingSubs].sort(
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
  const dueTomorrow = visibleSubscriptions.filter(
    (s) => s.status === "ACTIVE" && s.startDate.slice(0, 10) === tomorrowIso
  );

  function renderCard(subscription: SubscriptionView, i: number) {
    return (
      <Reveal key={subscription.id} style={{ transitionDelay: `${Math.min(i, 8) * 60}ms` }}>
        <ExpandableSubscriptionCard
          subscription={subscription}
          isEditing={editingId === subscription.id}
          onStartEdit={() => setEditingId(subscription.id)}
          onCancelEdit={() => setEditingId(null)}
          onSubmitEdit={(formData) => handleEdit(subscription.id, formData)}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </Reveal>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Tus suscripciones</h1>
        <Button onClick={() => setShowAddModal(true)}>+ Añadir suscripción</Button>
      </div>

      {dueTomorrow.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-sunflower/40 bg-sunflower/10 px-5 py-4">
          <ClockIcon size={20} color="#a8790a" className="mt-0.5 shrink-0" />
          <p className="text-sm font-bold text-ink">
            Recuerda comprarlas mañana:{" "}
            <span className="font-medium text-slate">{dueTomorrow.map((s) => s.serviceName).join(", ")}</span>
          </p>
        </div>
      ) : null}

      <SummaryStats nextCharge={nextCharge} scheduledCancellations={scheduledCancellations} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlySpendChart subscriptions={subscriptions} currency={currency} />
        <CategorySpendChart subscriptions={subscriptions} currency={currency} />
      </div>

      {visibleSubscriptions.length === 0 ? <EmptyState onAdd={() => setShowAddModal(true)} /> : null}

      {activeSubs.length > 0 ? (
        <div>
          <SectionHeader dotColor="#2ec4b6" title="Activas" count={activeSubs.length} />
          <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", partying && "animate-card-party")}>
            {activeSubs.map((s, i) => renderCard(s, i))}
          </div>
        </div>
      ) : null}

      {pendingSubs.length > 0 ? (
        <div>
          <SectionHeader dotColor="#ffc93c" title="Pendientes" count={pendingSubs.length} />
          <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", partying && "animate-card-party")}>
            {pendingSubs.map((s, i) => renderCard(s, i))}
          </div>
        </div>
      ) : null}

      {cancelledSubs.length > 0 ? (
        <div>
          <SectionHeader dotColor="#5b6472" title="Canceladas" count={cancelledSubs.length} />
          <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", partying && "animate-card-party")}>
            {cancelledSubs.map((s, i) => renderCard(s, i))}
          </div>
        </div>
      ) : null}

      {showAddModal ? (
        <SubscriptionModal title="Añadir suscripción" onClose={() => setShowAddModal(false)}>
          <SubscriptionForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
        </SubscriptionModal>
      ) : null}
    </div>
  );
}
