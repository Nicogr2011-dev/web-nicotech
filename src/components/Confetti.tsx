import { useEffect } from "react";

const COLORS = ["#FF5C5C", "#FFC93C", "#2EC4B6", "#3A86FF", "#8338EC", "#FF6FB5"];
const PIECES = Array.from({ length: 80 }, (_, i) => i);

/** Ráfaga de confeti a pantalla completa, pensada para el código Konami. */
export function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {PIECES.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 2 + Math.random() * 1.2;
        const rotate = Math.random() * 360;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-10px",
              left: `${left}%`,
              width: 8,
              height: 14,
              backgroundColor: COLORS[i % COLORS.length],
              transform: `rotate(${rotate}deg)`,
              animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
