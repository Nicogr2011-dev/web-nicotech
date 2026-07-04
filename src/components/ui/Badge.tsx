import { clsx } from "clsx";

const toneClasses = {
  active: "bg-mint/15 text-mint",
  cancelled: "bg-slate/15 text-slate",
  scheduled: "bg-grape/15 text-grape",
} as const;

export function Badge({
  tone = "active",
  children,
}: {
  tone?: keyof typeof toneClasses;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}
