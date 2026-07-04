import { addMonths, setDate, isBefore, startOfDay } from "date-fns";

/** Próxima fecha de cobro a partir de la fecha de cobro (se usa su día del mes) y una fecha de referencia. */
export function computeNextChargeDate(startDate: Date, referenceDate: Date = new Date()): Date {
  const billingDay = startDate.getDate();
  const today = startOfDay(referenceDate);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(billingDay, daysInMonth);

  let candidate = setDate(today, clampedDay);
  if (isBefore(candidate, today)) {
    const next = addMonths(today, 1);
    const daysInNextMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    candidate = setDate(next, Math.min(billingDay, daysInNextMonth));
  }
  return candidate;
}
