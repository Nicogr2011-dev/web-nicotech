"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { SubscriptionModal } from "@/components/dashboard/SubscriptionModal";
import { SubscriptionForm } from "@/components/dashboard/SubscriptionForm";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { createSubscription, updateSubscription } from "@/app/(dashboard)/dashboard/actions";
import type { SubscriptionView } from "./types";

export function SubscriptionsSection({
  subscriptions,
  monthlyTotal,
  currency,
  nextCharge,
  scheduledCancellations,
}: {
  subscriptions: SubscriptionView[];
  monthlyTotal: number;
  currency: string;
  nextCharge: { serviceName: string; date: string } | null;
  scheduledCancellations: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "add" | { edit: SubscriptionView }>(null);

  async function handleAdd(formData: FormData) {
    await createSubscription(formData);
    setModal(null);
    router.refresh();
  }

  async function handleEdit(id: string, formData: FormData) {
    await updateSubscription(id, formData);
    setModal(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Tus suscripciones</h1>
        <Button onClick={() => setModal("add")}>+ Añadir suscripción</Button>
      </div>

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
