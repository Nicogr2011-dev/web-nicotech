import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { SubscriptionForm } from "@/components/dashboard/SubscriptionForm";
import type { SubscriptionView } from "./types";

export function ExpandableSubscriptionCard({
  subscription,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onToggle,
}: {
  subscription: SubscriptionView;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl transition-[max-height] duration-300 ease-in-out",
        isEditing ? "max-h-[950px]" : "max-h-[460px]"
      )}
    >
      {isEditing ? (
        <Card
          className="flex flex-col gap-4 border-l-4 p-5"
          style={{ borderLeftColor: subscription.accentColor }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Editar {subscription.serviceName}</h3>
            <button onClick={onCancelEdit} className="text-slate hover:text-ink" aria-label="Cerrar edición">
              ✕
            </button>
          </div>
          <SubscriptionForm subscription={subscription} onSubmit={onSubmitEdit} onCancel={onCancelEdit} />
        </Card>
      ) : (
        <SubscriptionCard
          subscription={subscription}
          onEdit={onStartEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}
