const PALETTE = ["#ff5c5c", "#ffc93c", "#2ec4b6", "#3a86ff", "#8338ec", "#ff6fb5"];

export function PaletteDots({ size = 6 }: { size?: number }) {
  return (
    <div className="mt-1 flex justify-center gap-1">
      {PALETTE.map((color) => (
        <span
          key={color}
          className="inline-block rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      ))}
    </div>
  );
}
