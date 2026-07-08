import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { number: "1", title: "Crea tu cuenta", text: "Regístrate gratis en menos de un minuto.", color: "#ff5c5c" },
  { number: "2", title: "Añade tus suscripciones", text: "Busca el servicio, elige el plan y su día de cobro.", color: "#3a86ff" },
  { number: "3", title: "Consulta tu panel", text: "Mira de un vistazo qué se te cobra y cuándo.", color: "#2ec4b6" },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-extrabold text-body">Cómo funciona</h2>
      </Reveal>
      <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div
          className="absolute top-7 z-0 hidden h-0.5 sm:block"
          style={{
            left: "16.5%",
            right: "16.5%",
            backgroundImage: "repeating-linear-gradient(to right, rgba(15,17,21,0.12) 0 8px, transparent 8px 16px)",
          }}
        />
        {steps.map((step, i) => (
          <Reveal key={step.number} className="relative z-10 text-center" style={{ transitionDelay: `${i * 100}ms` }}>
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 bg-surface font-display text-xl font-extrabold"
              style={{ borderColor: step.color, color: step.color }}
            >
              {step.number}
            </div>
            <h3 className="mt-5 font-display font-bold text-body">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-60 text-sm text-muted">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
