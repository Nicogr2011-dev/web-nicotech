export function Avatar({
  name,
  avatarUrl,
  size = 32,
}: {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-azure/10 font-display font-bold text-azure"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
