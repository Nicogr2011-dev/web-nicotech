const PALETTE = ["#ff5c5c", "#ffc93c", "#2ec4b6", "#3a86ff", "#8338ec", "#ff6fb5"];

export function TierBadge({ tier }: { tier: "BASICO" | "PREMIUM" | "PREMIUM_LITE" }) {
  if (tier === "PREMIUM" || tier === "PREMIUM_LITE") {
    return (
      <span className="text-xs font-bold tracking-wide">
        {"Premium".split("").map((char, i) => (
          <span key={i} style={{ color: PALETTE[i % PALETTE.length] }}>
            {char}
          </span>
        ))}
        {tier === "PREMIUM_LITE" ? <span className="text-slate/70"> Lite</span> : null}
      </span>
    );
  }

  return <span className="text-xs font-bold tracking-wide text-slate/70">Básico</span>;
}
