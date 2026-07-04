import { Reveal } from "@/components/landing/Reveal";

const steps = [
  { number: "1", title: "Crea tu cuenta", text: "Regístrate gratis en menos de un minuto.", color: "text-coral" },
  { number: "2", title: "Añade tus suscripciones", text: "Busca el servicio, elige el plan y su día de cobro.", color: "text-azure" },
  { number: "3", title: "Consulta tu panel", text: "Mira de un vistazo qué se te cobra y cuándo.", color: "text-mint" },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-extrabold text-ink">Cómo funciona</h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
        {steps.map((step) => (
          <Reveal key={step.number} className="text-center">
            <span className={`font-display text-5xl font-extrabold ${step.color}`}>{step.number}</span>
            <h3 className="mt-3 font-display font-bold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-slate">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
