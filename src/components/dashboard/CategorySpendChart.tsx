import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { findCatalogServiceByName } from "@/lib/serviceCatalog";
import type { SubscriptionView } from "./types";

const CAT_COLORS = ["#3a86ff", "#2ec4b6", "#8338ec", "#ffc93c", "#ff6fb5", "#ff5c5c"];

function categoryFor(serviceName: string): string {
  return findCatalogServiceByName(serviceName)?.category ?? "Otros";
}

/** Desglose de gasto por categoría, en barra apilada o en tarta (se cambia pulsando el título). */
export function CategorySpendChart({
  subscriptions,
  currency,
}: {
  subscriptions: SubscriptionView[];
  currency: string;
}) {
  const [mode, setMode] = useState<"bar" | "pie">("bar");
  const nonCancelled = subscriptions.filter((s) => s.status !== "CANCELLED");

  const catMap = new Map<string, number>();
  nonCancelled.forEach((s) => {
    const cat = categoryFor(s.serviceName);
    catMap.set(cat, (catMap.get(cat) ?? 0) + s.price);
  });
  const catTotal = [...catMap.values()].reduce((a, b) => a + b, 0) || 1;
  const breakdown = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, total], i) => ({
      name,
      totalLabel: total.toLocaleString("es-ES", { style: "currency", currency }),
      pct: Math.round((total / catTotal) * 100),
      color: CAT_COLORS[i % CAT_COLORS.length],
    }));

  let acc = 0;
  const pieStops = breakdown.map((c) => {
    const start = acc;
    acc += (c.pct / 100) * 360;
    return `${c.color} ${start}deg ${acc}deg`;
  });
  const pieGradient = pieStops.length ? `conic-gradient(${pieStops.join(", ")})` : "#f0f1f3";
  const totalLabel = catTotal.toLocaleString("es-ES", { style: "currency", currency });

  return (
    <Card className="p-6">
      <button
        type="button"
        onClick={() => setMode((m) => (m === "bar" ? "pie" : "bar"))}
        title="Pulsa para cambiar de vista"
        className="mb-4 text-sm font-bold text-ink"
      >
        Gasto por categoría
      </button>

      {mode === "bar" ? (
        <div className="flex h-2.5 overflow-hidden rounded-full bg-mist">
          {breakdown.map((cat) => (
            <div key={cat.name} style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-1 pb-2.5">
          <div className="relative h-[140px] w-[140px]">
            <div className="h-[140px] w-[140px] rounded-full shadow-soft-lg" style={{ background: pieGradient }} />
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white shadow-soft">
              <span className="font-display text-[15px] font-extrabold text-ink">{totalLabel}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate">al mes</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {breakdown.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium text-ink">{cat.name}</span>
            </div>
            <span className="font-semibold text-slate">{cat.totalLabel}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
