import { forwardRef } from "react";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={clsx("rounded-2xl bg-white shadow-soft", className)} {...props} />;
});
