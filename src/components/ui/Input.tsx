import { forwardRef } from "react";
import { clsx } from "clsx";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx("mb-1.5 block text-sm font-semibold text-body", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-hairline bg-surface px-4 py-2.5 text-body placeholder:text-muted/60 outline-none transition-colors focus:border-azure focus:ring-2 focus:ring-azure/20",
        className
      )}
      {...props}
    />
  );
}

export const IconInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; rightSlot?: ReactNode }
>(function IconInput({ icon, rightSlot, className, ...props }, ref) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-xl border border-hairline bg-surface py-2.5 pl-10 text-body placeholder:text-muted/60 outline-none transition-colors focus:border-azure focus:ring-2 focus:ring-azure/20",
          rightSlot ? "pr-10" : "pr-4",
          className
        )}
        {...props}
      />
      {rightSlot ? <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span> : null}
    </div>
  );
});

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
