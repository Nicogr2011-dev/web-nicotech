import { clsx } from "clsx";

const toneClasses = {
  active: "bg-mint/15 text-mint",
  cancelled: "bg-slate/15 text-slate",
  scheduled: "bg-grape/15 text-grape",
  pending: "bg-black/10 text-ink/60",
  danger: "bg-coral/15 text-coral",
} as const;

export function Badge({
  tone = "active",
  title,
  children,
}: {
  tone?: keyof typeof toneClasses;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={clsx("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", toneClasses[tone])}
    >
      {children}
    </span>
  );
}
