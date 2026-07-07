import { addMonths, setDate, isBefore, startOfDay } from "date-fns";

/** Una suscripción activa cuya fecha de cobro todavía no ha llegado (aún no se ha comprado). */
export function isPendingPurchase(subscription: { status: string; startDate: string }): boolean {
  const todayIso = new Date().toISOString().slice(0, 10);
  return subscription.status === "ACTIVE" && subscription.startDate.slice(0, 10) > todayIso;
}

/**
 * Fecha en la que una suscripción dejó de contar de verdad (se canceló o se eliminó),
 * la que ocurriera antes. Null si sigue en marcha. Se usa para que el gasto histórico
 * de los meses en que SÍ estuvo activa no desaparezca al cancelarla o eliminarla.
 */
export function effectiveEndDate(subscription: { cancelledAt: string | null; deletedAt: string | null }): Date | null {
  const dates = [subscription.cancelledAt, subscription.deletedAt]
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d));
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

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
