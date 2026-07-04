"use client";

import { useEffect, useRef, useState } from "react";
import { searchServices, type CatalogService, type ServicePlan } from "@/lib/serviceCatalog";
import { Input, Label } from "@/components/ui/Input";

export function ServiceSearchCombobox({
  value,
  onQueryChange,
  onSelectPlan,
}: {
  value: string;
  onQueryChange: (value: string) => void;
  onSelectPlan: (values: { serviceName: string; price: number; currency: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [planPicker, setPlanPicker] = useState<CatalogService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchServices(value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPlanPicker(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePickService(service: CatalogService) {
    if (service.plans.length === 1) {
      choosePlan(service, service.plans[0]);
    } else {
      setPlanPicker(service);
    }
  }

  function choosePlan(service: CatalogService, plan: ServicePlan) {
    const serviceName = service.plans.length > 1 ? `${service.name} (${plan.name})` : service.name;
    onQueryChange(serviceName);
    onSelectPlan({ serviceName, price: plan.price, currency: plan.currency });
    setOpen(false);
    setPlanPicker(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="serviceName">Servicio</Label>
      <Input
        id="serviceName"
        name="serviceName"
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
          setPlanPicker(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Busca Netflix, Spotify, ChatGPT Plus…"
        required
      />

      {open && !planPicker && results.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-soft-lg">
          {results.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => handlePickService(service)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-mist"
              >
                <span className="font-medium text-ink">{service.name}</span>
                <span className="text-xs text-slate">{service.category}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && !planPicker && value.trim() && results.length === 0 ? (
        <p className="mt-1 text-xs text-slate">
          No está en el catálogo — se usará &ldquo;{value}&rdquo; tal cual, y podrás poner el precio a mano.
        </p>
      ) : null}

      {planPicker ? (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-black/10 bg-white p-3 shadow-soft-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
            Elige el plan de {planPicker.name}
          </p>
          <div className="flex flex-col gap-1.5">
            {planPicker.plans.map((plan) => (
              <button
                type="button"
                key={plan.name}
                onClick={() => choosePlan(planPicker, plan)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-mist"
              >
                <span className="text-ink">{plan.name}</span>
                <span className="font-semibold text-ink">
                  {plan.price.toLocaleString("es-ES", { style: "currency", currency: plan.currency })}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
