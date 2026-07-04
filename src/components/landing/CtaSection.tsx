import { ButtonLink } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section className="bg-azure px-4 py-20 text-center sm:px-6">
      <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
        Empieza a organizar tus suscripciones hoy
      </h2>
      <p className="mx-auto mt-3 max-w-md text-white/80">Es gratis y solo lleva un minuto.</p>
      <div className="mt-8">
        <ButtonLink href="/register" variant="secondary" className="bg-white !text-azure hover:bg-white/90">
          Crear cuenta gratis
        </ButtonLink>
      </div>
    </section>
  );
}
