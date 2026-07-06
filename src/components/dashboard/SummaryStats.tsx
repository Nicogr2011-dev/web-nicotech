import { Card } from "@/components/ui/Card";

export function SummaryStats({
  nextCharge,
  scheduledCancellations,
}: {
  nextCharge: { serviceName: string; date: string } | null;
  scheduledCancellations: number;
}) {
  const stats = [
    {
      label: "Próximo cobro",
      value: nextCharge ? `${nextCharge.serviceName} · ${nextCharge.date}` : "—",
      accent: "text-mint",
    },
    {
      label: "Cancelaciones programadas",
      value: String(scheduledCancellations),
      accent: "text-grape",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">{stat.label}</p>
          <p className={`mt-2 truncate font-display text-xl font-bold ${stat.accent}`}>{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
