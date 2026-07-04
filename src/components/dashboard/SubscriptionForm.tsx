"use client";

import { useState } from "react";
import { Field, Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ACCENT_COLORS } from "@/lib/validation";
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
  const [autoCancelEnabled, setAutoCancelEnabled] = useState(Boolean(subscription?.autoCancelAfterMonths));
  const [accentColor, setAccentColor] = useState(subscription?.accentColor ?? ACCENT_COLORS[0]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("accentColor", accentColor);
    if (!autoCancelEnabled) formData.set("autoCancelAfterMonths", "");

    try {
      await onSubmit(formData);
    } catch {
      setError("No se pudo guardar la suscripción. Revisa los datos.");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Field label="Nombre del servicio" htmlFor="serviceName">
        <Input
          id="serviceName"
          name="serviceName"
          type="text"
          defaultValue={subscription?.serviceName}
          placeholder="Netflix, Spotify…"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={subscription?.price}
            required
          />
        </Field>
        <Field label="Moneda" htmlFor="currency">
          <Input id="currency" name="currency" type="text" defaultValue={subscription?.currency ?? "EUR"} maxLength={3} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Día de cobro (1-31)" htmlFor="billingDay">
          <Input
            id="billingDay"
            name="billingDay"
            type="number"
            min={1}
            max={31}
            defaultValue={subscription?.billingDay}
            required
          />
        </Field>
        <Field label="Fecha de inicio" htmlFor="startDate">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={subscription?.startDate?.slice(0, 10)}
            required
          />
        </Field>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={autoCancelEnabled}
            onChange={(e) => setAutoCancelEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-azure focus:ring-azure/30"
          />
          Cancelar automáticamente después de un tiempo
        </label>
        {autoCancelEnabled ? (
          <Input
            className="mt-2"
            name="autoCancelAfterMonths"
            type="number"
            min={1}
            max={120}
            defaultValue={subscription?.autoCancelAfterMonths ?? 6}
            placeholder="Número de meses"
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
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
