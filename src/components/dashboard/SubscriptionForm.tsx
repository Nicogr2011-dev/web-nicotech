import { useEffect, useRef, useState } from "react";
import { Field, Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ACCENT_COLORS } from "@/lib/validation";
import { localIsoDate } from "@/lib/subscriptions";
import { ApiError } from "@/lib/api";
import { ServiceSearchCombobox } from "@/components/dashboard/ServiceSearchCombobox";
import type { SubscriptionView } from "./types";

/**
 * Compra desde el formulario: "waiting" mientras la web del servicio está abierta,
 * "confirm" al volver (¿la has comprado?), y luego "bought" (revisa precio y guarda)
 * o "later" (se guarda como Pendiente en la fecha que elija).
 */
type PurchaseStep = null | "waiting" | "confirm" | "bought" | "later";

function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return localIsoDate(d);
}

const MAGIC_NAMES = new Set(["skynet", "hal9000", "hal 9000"]);
const MAGIC_NAME_JOKE =
  "🤖 Buen intento. Nicotech no gestiona suscripciones a inteligencias artificiales con planes de dominación mundial. Prueba con Netflix.";

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
  const [joke, setJoke] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState(subscription?.serviceName ?? "");
  const [price, setPrice] = useState(subscription?.price?.toString() ?? "");
  const [currency, setCurrency] = useState(subscription?.currency ?? "EUR");
  const [website, setWebsite] = useState<string | null>(null);
  const [cancelEnabled, setCancelEnabled] = useState(Boolean(subscription?.cancelDate));
  const [accentColor, setAccentColor] = useState(subscription?.accentColor ?? ACCENT_COLORS[0]);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const popupPollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (popupPollRef.current) window.clearInterval(popupPollRef.current);
    };
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setJoke(null);

    if (MAGIC_NAMES.has(serviceName.trim().toLowerCase())) {
      setJoke(MAGIC_NAME_JOKE);
      return;
    }

    setPending(true);
    formData.set("serviceName", serviceName);
    formData.set("accentColor", accentColor);
    if (!cancelEnabled) formData.set("cancelDate", "");

    try {
      await onSubmit(formData);
    } catch (err) {
      // El servidor explica el motivo (ej. "Has alcanzado el límite de 3 suscripciones…").
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la suscripción. Revisa los datos.");
      setPending(false);
    }
  }

  function setStartDate(value: string) {
    const input = formRef.current?.elements.namedItem("startDate") as HTMLInputElement | null;
    if (input) input.value = value;
  }

  function stopWaiting() {
    if (popupPollRef.current) window.clearInterval(popupPollRef.current);
    popupPollRef.current = null;
    setPurchaseStep("confirm");
  }

  function handleBought() {
    setStartDate(isoDate());
    setPurchaseStep("bought");
    (formRef.current?.elements.namedItem("price") as HTMLInputElement | null)?.focus();
  }

  function handleLater() {
    setStartDate(isoDate(1));
    setPurchaseStep("later");
  }

  function handleBuyClick() {
    if (!website) return;

    const popup = window.open(website, "nicotech_purchase", "width=480,height=760");
    if (!popup) {
      setError("El navegador bloqueó la ventana emergente. Permite ventanas emergentes para nicotech.es e inténtalo de nuevo.");
      return;
    }

    // Antes se daba por comprada al cerrar la ventana, aunque solo se hubiera mirado.
    // Ahora al cerrarla (o con "Ya he terminado") se pregunta.
    setError(null);
    setPurchaseStep("waiting");
    popupPollRef.current = window.setInterval(() => {
      if (popup.closed) stopWaiting();
    }, 500);
  }

  return (
    <form
      ref={formRef}
      // onSubmit y no action: React 19 vacía los formularios con action al terminar,
      // y si falla al guardar se perderían los datos (y la fecha elegida al comprar).
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <ServiceSearchCombobox
        value={serviceName}
        onQueryChange={(name) => {
          // Si escribe otro nombre a mano, "Comprar" ya no debe abrir la web del servicio que eligió antes.
          setServiceName(name);
          setWebsite(null);
        }}
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
          defaultValue={subscription?.startDate?.slice(0, 10) ?? localIsoDate()}
          required
        />
      </Field>
      {!subscription ? (
        <p className="-mt-2 text-xs text-muted">
          Por defecto es hoy. Si la pones en el futuro, la suscripción queda como "Pendiente" y te avisaremos un día
          antes para que la compres.
        </p>
      ) : null}

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-body">
          <input
            type="checkbox"
            checked={cancelEnabled}
            onChange={(e) => setCancelEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-hairline text-azure focus:ring-azure/30"
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

      {purchaseStep === "waiting" ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3 text-sm">
          <p className="text-muted">Termina la compra en la otra ventana y vuelve aquí.</p>
          <Button type="button" variant="ghost" className="shrink-0 px-4 py-2 text-sm" onClick={stopWaiting}>
            Ya he terminado
          </Button>
        </div>
      ) : null}

      {purchaseStep === "confirm" ? (
        <div className="rounded-xl border-2 border-azure bg-azure/5 px-4 py-4">
          <p className="font-semibold text-body">¿Has completado la compra en {serviceName}?</p>
          <div className="mt-3 flex flex-col gap-2">
            <Button type="button" className="px-4 py-2 text-sm" onClick={handleBought}>
              Sí, ya la tengo
            </Button>
            <Button type="button" variant="secondary" className="px-4 py-2 text-sm" onClick={handleLater}>
              Todavía no
            </Button>
            <Button type="button" variant="ghost" className="px-4 py-2 text-sm" onClick={() => setPurchaseStep(null)}>
              No la voy a comprar
            </Button>
          </div>
        </div>
      ) : null}

      {purchaseStep === "bought" ? (
        <p className="rounded-xl bg-mint/10 px-4 py-3 text-sm text-body">
          ¡Genial! Revisa que el precio y la fecha coinciden con lo que has pagado (a veces hay ofertas o impuestos) y
          pulsa Guardar.
        </p>
      ) : null}

      {purchaseStep === "later" ? (
        <p className="rounded-xl bg-sunflower/10 px-4 py-3 text-sm text-body">
          Elige en "Fecha de cobro" cuándo la vas a comprar. Se guardará como Pendiente y te lo recordaremos el día antes.
        </p>
      ) : null}

      {joke ? <p className="text-sm font-semibold text-grape">{joke}</p> : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        {!subscription && website && purchaseStep === null ? (
          <Button type="button" variant="secondary" onClick={handleBuyClick}>
            Comprar
          </Button>
        ) : null}
        <Button type="submit" disabled={pending || purchaseStep === "waiting" || purchaseStep === "confirm"}>
          {pending ? "Guardando…" : purchaseStep === "later" ? "Guardar como pendiente" : purchaseStep === "bought" ? "Guardar" : "Aceptar"}
        </Button>
      </div>
    </form>
  );
}
