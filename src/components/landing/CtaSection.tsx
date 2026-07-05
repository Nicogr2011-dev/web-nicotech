import { ButtonLink } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section
      className="relative overflow-hidden bg-azure px-4 py-[88px] text-center sm:px-6"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 2px, transparent 2px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="relative z-10">
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Empieza a organizar tus suscripciones hoy
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/85">Es gratis y solo lleva un minuto.</p>
        <div className="mt-8">
          <ButtonLink href="/register" variant="secondary" className="bg-white !text-azure hover:bg-white/90">
            Crear cuenta gratis
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
