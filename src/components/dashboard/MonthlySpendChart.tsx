import { useState } from "react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { effectiveEndDate } from "@/lib/subscriptions";
import type { SubscriptionView } from "./types";

function lastNMonths(n: number): Date[] {
  const arr: Date[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) arr.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  return arr;
}

/** Gráfica de gasto de los últimos 6 meses, en barras o en línea (se cambia pulsando el título). */
export function MonthlySpendChart({
  subscriptions,
  currency,
}: {
  subscriptions: SubscriptionView[];
  currency: string;
}) {
  const [mode, setMode] = useState<"bar" | "line">("bar");

  const months = lastNMonths(6);
  const monthTotals = months.map((monthStart) => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const total = subscriptions.reduce((sum, s) => {
      const start = new Date(s.startDate);
      if (start > monthEnd) return sum; // todavía no había empezado
      const endBoundary = effectiveEndDate(s);
      if (endBoundary && endBoundary < monthStart) return sum; // ya había terminado antes de este mes
      return sum + s.price;
    }, 0);
    return { date: monthStart, total };
  });
  const maxTotal = Math.max(...monthTotals.map((m) => m.total), 1);
  const trend = monthTotals.map((m, i) => ({
    label: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(m.date),
    valueLabel: m.total.toLocaleString("es-ES", { style: "currency", currency }),
    barHeightPx: Math.max(6, Math.round((m.total / maxTotal) * 100)),
    isLast: i === monthTotals.length - 1,
  }));

  const lineStepX = 300 / (monthTotals.length - 1);
  const lineDots = monthTotals.map((m, i) => ({
    x: Math.round(i * lineStepX),
    y: Math.round(10 + (1 - m.total / maxTotal) * 70),
  }));
  const linePoints = lineDots.map((d) => `${d.x},${d.y}`).join(" ");

  return (
    <Card className="p-6">
      <button
        type="button"
        onClick={() => setMode((m) => (m === "bar" ? "line" : "bar"))}
        title="Pulsa para cambiar de vista"
        className="mb-4 text-sm font-bold text-ink"
      >
        Gasto mensual (últimos 6 meses)
      </button>

      {mode === "bar" ? (
        <div className="flex items-end gap-2.5">
          {trend.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-slate">{m.valueLabel}</span>
              <div className="flex h-[100px] w-full max-w-[34px] items-end">
                <div
                  className={clsx("w-full rounded-t-md rounded-b-sm", m.isLast ? "bg-azure" : "bg-azure/35")}
                  style={{ height: `${m.barHeightPx}px` }}
                />
              </div>
              <span className="text-xs font-semibold capitalize text-slate">{m.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <svg viewBox="0 0 300 90" width="100%" height={100} className="block overflow-visible">
            <polyline
              points={linePoints}
              fill="none"
              stroke="#3a86ff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {lineDots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={4} fill="#3a86ff" />
            ))}
          </svg>
          <div className="mt-2 flex justify-between">
            {trend.map((m) => (
              <span key={m.label} className="flex-1 text-center text-xs font-semibold capitalize text-slate">
                {m.label}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
