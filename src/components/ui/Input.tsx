import { clsx } from "clsx";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx("mb-1.5 block text-sm font-semibold text-ink", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink placeholder:text-slate/60 outline-none transition-colors focus:border-azure focus:ring-2 focus:ring-azure/20",
        className
      )}
      {...props}
    />
  );
}

export function IconInput({
  icon,
  rightSlot,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; rightSlot?: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate">{icon}</span>
      <input
        className={clsx(
          "w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 text-ink placeholder:text-slate/60 outline-none transition-colors focus:border-azure focus:ring-2 focus:ring-azure/20",
          rightSlot ? "pr-10" : "pr-4",
          className
        )}
        {...props}
      />
      {rightSlot ? <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-sm text-coral">{error}</p> : null}
    </div>
  );
}
