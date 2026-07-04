import { useState } from "react";
import { Field, Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ACCENT_COLORS } from "@/lib/validation";
import { ServiceSearchCombobox } from "@/components/dashboard/ServiceSearchCombobox";
import type { SubscriptionView } from "./types";

export function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
}: {
  subscription?: SubscriptionView;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState(subscription?.serviceName ?? "");
  const [price, setPrice] = useState(subscription?.price?.toString() ?? "");
  const [currency, setCurrency] = useState(subscription?.currency ?? "EUR");
  const [website, setWebsite] = useState<string | null>(null);
  const [cancelEnabled, setCancelEnabled] = useState(Boolean(subscription?.cancelDate));
  const [accentColor, setAccentColor] = useState(subscription?.accentColor ?? ACCENT_COLORS[0]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("serviceName", serviceName);
    formData.set("accentColor", accentColor);
    if (!cancelEnabled) formData.set("cancelDate", "");

    try {
      await onSubmit(formData);
    } catch {
      setError("No se pudo guardar la suscripción. Revisa los datos.");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <ServiceSearchCombobox
        value={serviceName}
        onQueryChange={setServiceName}
        onSelectPlan={({ serviceName, price, currency, website }) => {
          setServiceName(serviceName);
          setPrice(String(price));
          setCurrency(currency);
          setWebsite(website);
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Field>
        <Field label="Moneda" htmlFor="currency">
          <Input
            id="currency"
            name="currency"
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={3}
            required
          />
        </Field>
      </div>

      <Field label="Fecha de cobro" htmlFor="startDate">
        <Input
          id="startDate"
          name="startDate"
          type="date"
          defaultValue={subscription?.startDate?.slice(0, 10)}
          required
        />
      </Field>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={cancelEnabled}
            onChange={(e) => setCancelEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-azure focus:ring-azure/30"
          />
          Cancelar automáticamente en una fecha
        </label>
        {cancelEnabled ? (
          <Input
            className="mt-2"
            name="cancelDate"
            type="date"
            defaultValue={subscription?.cancelDate?.slice(0, 10)}
          />
        ) : null}
      </div>

      <div>
        <Label>Color</Label>
        <div className="mt-1 flex gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setAccentColor(color)}
              className="h-8 w-8 rounded-full ring-offset-2 transition-all"
              style={{ backgroundColor: color, boxShadow: accentColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined }}
              aria-label={`Elegir color ${color}`}
            />
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        {!subscription && website ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.open(website, "_blank", "noopener,noreferrer")}
          >
            Comprar
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Aceptar"}
        </Button>
      </div>
    </form>
  );
}
