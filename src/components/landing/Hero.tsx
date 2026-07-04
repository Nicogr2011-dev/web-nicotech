import { ButtonLink } from "@/components/ui/Button";

const previewCards = [
  { name: "Netflix", price: "12,99 €", color: "var(--color-coral)", rotate: "-rotate-6", offset: "translate-y-4" },
  { name: "Spotify", price: "9,99 €", color: "var(--color-mint)", rotate: "rotate-3", offset: "-translate-y-2" },
  { name: "iCloud+", price: "2,99 €", color: "var(--color-azure)", rotate: "-rotate-2", offset: "translate-y-8" },
];

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-24">
      <div>
        <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Organiza todas tus suscripciones en un solo lugar
        </h1>
        <p className="mt-5 max-w-md text-lg text-slate">
          Registra las suscripciones que ya tienes, elige el día en que se cobran y programa que se cancelen solas
          cuando quieras. Sin sorpresas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register">Crear cuenta gratis</ButtonLink>
          <ButtonLink href="#como-funciona" variant="ghost">
            Ver cómo funciona
          </ButtonLink>
        </div>
      </div>

      <div className="relative flex h-72 items-center justify-center sm:h-80">
        {previewCards.map((card, i) => (
          <div
            key={card.name}
            className={`absolute w-44 rounded-2xl bg-white p-5 shadow-soft-lg ${card.rotate} ${card.offset}`}
            style={{ left: `${i * 120}px`, zIndex: i }}
          >
            <div className="mb-3 h-2 w-10 rounded-full" style={{ backgroundColor: card.color }} />
            <p className="font-display font-bold text-ink">{card.name}</p>
            <p className="text-sm text-slate">{card.price}/mes</p>
          </div>
        ))}
      </div>
    </section>
  );
}
