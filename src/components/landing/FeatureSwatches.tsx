import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { BoltIcon, CalendarIcon, HourglassIcon, ChartIcon } from "@/components/ui/Icon";
import { apiGet } from "@/lib/api";

const features = [
  {
    icon: <BoltIcon color="#ff5c5c" />,
    title: "Regístralas en segundos",
    text: "Busca cualquier servicio en nuestro catálogo de +170 marcas o añádelo a mano.",
    bg: "bg-coral/10",
  },
  {
    icon: <CalendarIcon color="#ffc93c" />,
    title: "Elige el día exacto de cobro",
    text: "Nosotros calculamos solos la fecha del próximo cargo, cada mes.",
    bg: "bg-sunflower/10",
  },
  {
    icon: <HourglassIcon color="#2ec4b6" />,
    title: "Programa la cancelación",
    text: "Marca el día en que quieres cancelar una suscripción. Sin recordatorios que se te olviden.",
    bg: "bg-mint/10",
  },
  {
    icon: <ChartIcon color="#8338ec" />,
    title: "Todo en un panel",
    text: "Gasto mensual total, próximos cobros y cancelaciones, de un vistazo.",
    bg: "bg-grape/10",
  },
];

function DancingText({ segments }: { segments: { text: string; color?: string }[] }) {
  let letterIndex = 0;
  return (
    <>
      {segments.map((segment, si) =>
        segment.text.split(" ").map((word, wi) => (
          <span key={`${si}-${wi}`} className="mr-[0.28em] inline-block whitespace-nowrap last:mr-0">
            {word.split("").map((char, ci) => {
              const delay = letterIndex * 0.04;
              letterIndex += 1;
              return (
                <span
                  key={ci}
                  className="inline-block"
                  style={{
                    animation: "letter-dance 2.4s ease-in-out infinite",
                    animationDelay: `${delay}s`,
                    color: segment.color,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))
      )}
    </>
  );
}

export function FeatureSwatches() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ count: number }>("/stats/user-count.php")
      .then((data) => setUserCount(data.count))
      .catch(() => {});
  }, []);

  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        {userCount !== null && userCount > 0 ? (
          <p className="mb-4 text-center font-display text-3xl font-extrabold text-ink">
            <DancingText
              segments={[
                { text: "Ya somos" },
                { text: `${userCount}`, color: "#3a86ff" },
                { text: `${userCount === 1 ? "persona" : "personas"}, únete tú` },
              ]}
            />
          </p>
        ) : null}
        <h2 className="text-center font-display text-3xl font-extrabold text-ink">
          Todo lo que necesitas para no perder de vista un solo cobro
        </h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <Reveal key={feature.title} className={`rounded-2xl p-6 ${feature.bg}`} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-white">
              {feature.icon}
            </div>
            <h3 className="mt-4 font-display font-bold text-ink">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate">{feature.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
