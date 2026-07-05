const PALETTE = ["#ff5c5c", "#ffc93c", "#2ec4b6", "#3a86ff", "#8338ec", "#ff6fb5"];

export function TierBadge({ tier }: { tier: "BASICO" | "PREMIUM" }) {
  if (tier === "PREMIUM") {
    return (
      <span className="text-xs font-bold tracking-wide">
        {"Premium".split("").map((char, i) => (
          <span key={i} style={{ color: PALETTE[i % PALETTE.length] }}>
            {char}
          </span>
        ))}
      </span>
    );
  }

  return <span className="text-xs font-bold tracking-wide text-slate/70">Básico</span>;
}
