import { ButtonLink } from "@/components/ui/Button";

const PALETTE = ["#ff5c5c", "#ffc93c", "#2ec4b6", "#3a86ff", "#8338ec", "#ff6fb5"];

const heroCards = [
  { name: "Netflix", price: "12,99 €", color: PALETTE[0], left: "0px", top: "60px", rot: -7, duration: 5 },
  { name: "Spotify", price: "9,99 €", color: PALETTE[2], left: "108px", top: "8px", rot: 4, duration: 5.6 },
  { name: "iCloud+", price: "2,99 €", color: PALETTE[3], left: "216px", top: "84px", rot: -3, duration: 6.2 },
  { name: "Disney+", price: "8,99 €", color: PALETTE[4], left: "48px", top: "170px", rot: 6, duration: 6.8 },
  { name: "YouTube Premium", price: "13,99 €", color: PALETTE[5], left: "160px", top: "205px", rot: -5, duration: 7.4 },
];

const line1 = "Organiza todas tus".split(" ");
const line2 = "suscripciones en un solo lugar".split(" ");

const hoverTimers = new WeakMap<HTMLElement, number>();

function handleLetterEnter(e: React.MouseEvent<HTMLSpanElement>, color: string) {
  const el = e.currentTarget;
  const existing = hoverTimers.get(el);
  if (existing) window.clearTimeout(existing);
  hoverTimers.delete(el);
  el.style.color = color;
  el.style.animation = "letter-dance 0.6s ease-in-out infinite";
}

function handleLetterLeave(e: React.MouseEvent<HTMLSpanElement>) {
  const el = e.currentTarget;
  const timer = window.setTimeout(() => {
    el.style.color = "";
    el.style.animation = "";
    hoverTimers.delete(el);
  }, 3000);
  hoverTimers.set(el, timer);
}

function AnimatedLine({ words, letterOffset }: { words: string[]; letterOffset: number }) {
  let i = letterOffset;
  return (
    <>
      {words.map((word, wi) => (
        <span key={wi} className="mr-[0.28em] inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => {
            const color = PALETTE[i % PALETTE.length];
            i += 1;
            return (
              <span
                key={ci}
                className="inline-block cursor-default transition-colors duration-200"
                onMouseEnter={(e) => handleLetterEnter(e, color)}
                onMouseLeave={handleLetterLeave}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
      <div>
        <h1
          className="font-display text-4xl font-extrabold text-ink sm:text-5xl"
          style={{ lineHeight: 1.08 }}
        >
          <AnimatedLine words={line1} letterOffset={0} />
          <br />
          <AnimatedLine words={line2} letterOffset={line1.join("").length} />
        </h1>
        <p className="mt-5 max-w-md text-lg text-slate">
          Busca el servicio, elige el plan con su precio real, fija el día de cobro y programa cuándo quieres
          cancelarla.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register">Crear cuenta gratis</ButtonLink>
          <button
            onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink/5"
          >
            Ver cómo funciona
          </button>
        </div>
      </div>

      <div className="relative h-72 sm:h-[340px]">
        {heroCards.map((card, i) => (
          <div
            key={card.name}
            className="absolute w-40 rounded-2xl bg-white p-4 shadow-soft-lg sm:w-[168px]"
            style={
              {
                left: card.left,
                top: card.top,
                zIndex: i,
                "--rot": `${card.rot}deg`,
                animation: `float-card ${card.duration}s ease-in-out infinite`,
              } as React.CSSProperties
            }
          >
            <div className="mb-3 h-2 w-10 rounded-full" style={{ backgroundColor: card.color }} />
            <p className="font-display font-bold text-ink">{card.name}</p>
            <p className="text-sm text-slate">{card.price}/mes</p>
          </div>
        ))}
        <div
          className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-soft-lg"
          style={{ animation: "badge-pulse 3s ease-in-out infinite" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint" />
          Próximo cobro en 3 días
        </div>
      </div>
    </section>
  );
}
