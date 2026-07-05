import { useEffect, useRef, useState } from "react";

/**
 * Hueco reservado para un futuro banner publicitario (formato "leaderboard",
 * 728x90 en escritorio / 320x50 en móvil). De momento NO carga ningún script
 * ni anuncio real — solo reserva el espacio y detecta si un bloqueador de
 * anuncios lo está ocultando, para avisar al usuario.
 *
 * Las cuentas Premium no ven nada de esto (ni el hueco ni el aviso).
 */
export function AdSlot({ tier }: { tier?: "BASICO" | "PREMIUM" }) {
  const [blocked, setBlocked] = useState(false);
  const baitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tier === "PREMIUM") return;

    const timer = window.setTimeout(() => {
      const el = baitRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const hidden =
        el.offsetParent === null ||
        el.offsetHeight === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";
      if (hidden) setBlocked(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [tier]);

  if (tier === "PREMIUM") return null;

  if (blocked) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-sunflower/40 bg-sunflower/10 px-5 py-4 text-center text-sm text-ink">
        Parece que tienes un bloqueador de anuncios activo. Nicotech es gratis gracias a la publicidad — desactívalo
        para esta web para poder seguir usándola. (Las cuentas <span className="font-semibold">Premium</span> no ven
        publicidad).
      </div>
    );
  }

  return (
    <div
      ref={baitRef}
      className="adsbygoogle ad-banner mx-auto flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl border border-dashed border-black/10 text-xs text-slate/50"
      aria-hidden="true"
    >
      Espacio publicitario
    </div>
  );
}
