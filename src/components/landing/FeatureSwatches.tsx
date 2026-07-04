import { Reveal } from "@/components/landing/Reveal";

const features = [
  {
    icon: "⚡",
    title: "Regístralas en segundos",
    text: "Busca cualquier servicio en nuestro catálogo o añádelo a mano.",
    bg: "bg-coral/10",
  },
  {
    icon: "📅",
    title: "Elige el día de cobro",
    text: "Define cuándo se cobra cada servicio y consulta el próximo cargo.",
    bg: "bg-sunflower/10",
  },
  {
    icon: "⏳",
    title: "Programa la cancelación",
    text: "Marca la fecha exacta en la que una suscripción se cancela sola.",
    bg: "bg-mint/10",
  },
  {
    icon: "📊",
    title: "Todo en un panel",
    text: "Visualiza el gasto mensual total y qué se te va a cobrar próximamente.",
    bg: "bg-grape/10",
  },
];

export function FeatureSwatches() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-extrabold text-ink">Todo lo que necesitas para empezar</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <Reveal key={feature.title} className={`rounded-2xl p-6 ${feature.bg}`} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="text-3xl">{feature.icon}</div>
            <h3 className="mt-4 font-display font-bold text-ink">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate">{feature.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
