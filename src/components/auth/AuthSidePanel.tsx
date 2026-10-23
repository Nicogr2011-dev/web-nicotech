import { Link } from "react-router-dom";
import { PaletteDots } from "@/components/ui/PaletteDots";

const SHOWCASE = [
  { name: "Netflix", detail: "Streaming · cobra el 4", price: "12,99 €", color: "#ff5c5c" },
  { name: "Spotify", detail: "Música · cobra el 10", price: "9,99 €", color: "#2ec4b6" },
  { name: "Notion", detail: "Software · cobra el 18", price: "8,00 €", color: "#8338ec" },
];

/** Panel oscuro de la izquierda en registro e inicio de sesión (oculto en móvil). */
export function AuthSidePanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 sm:flex">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(58,134,255,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(131,56,236,0.3), transparent 50%)",
        }}
      />

      <Link to="/" className="relative flex flex-col items-center self-start">
        <span className="font-display text-xl font-extrabold tracking-tight text-white">
          Nico<span className="text-[#6fa8ff]">tech</span>
        </span>
        <div className="mt-2.5">
          <PaletteDots size={7} />
        </div>
      </Link>

      <div className="relative flex flex-col gap-4">
        {SHOWCASE.map((card, i) => (
          <div
            key={card.name}
            className="flex max-w-[340px] items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4.5 py-4 backdrop-blur-sm"
            style={{ animation: `float-card 5s ease-in-out ${i * 0.4}s infinite` }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: card.color }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{card.name}</p>
              <p className="mt-0.5 text-xs text-white/55">{card.detail}</p>
            </div>
            <span className="text-sm font-bold text-white">{card.price}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <p className="max-w-[380px] font-display text-2xl font-extrabold leading-tight text-white">{title}</p>
        <p className="mt-3 max-w-[340px] text-sm text-white/60">{subtitle}</p>
      </div>
    </div>
  );
}
