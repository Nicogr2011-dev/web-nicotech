import { addMonths, setDate, isBefore, startOfDay } from "date-fns";

/**
 * Fecha YYYY-MM-DD del calendario local. No usar toISOString().slice(0, 10): da la
 * fecha en UTC, que en España es el día anterior entre las 00:00 y las 02:00.
 */
export function localIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Lee "YYYY-MM-DD" (o "YYYY-MM-DD hh:mm:ss") como medianoche local; new Date("YYYY-MM-DD") la toma en UTC. */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Si el próximo cobro llega después de la cancelación programada, no habrá tal cobro. */
export function chargesBeforeCancelling(subscription: { cancelDate: string | null; nextChargeDate: string }): boolean {
  return !subscription.cancelDate || localIsoDate(new Date(subscription.nextChargeDate)) < subscription.cancelDate.slice(0, 10);
}

/** Una suscripción activa cuya fecha de cobro todavía no ha llegado (aún no se ha comprado). */
export function isPendingPurchase(subscription: { status: string; startDate: string }): boolean {
  const todayIso = localIsoDate();
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
    // MySQL da "YYYY-MM-DD hh:mm:ss": con espacio Safari no lo entiende (Invalid Date).
    .map((d) => new Date(d.replace(" ", "T")));
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/** Próxima fecha de cobro a partir de la fecha de cobro (se usa su día del mes) y una fecha de referencia. */
export function computeNextChargeDate(startDate: Date, referenceDate: Date = new Date()): Date {
  const billingDay = startDate.getDate();
  const today = startOfDay(referenceDate);
  // Una pendiente se cobra por primera vez en su fecha, no el próximo día N del mes.
  if (isBefore(today, startOfDay(startDate))) return startOfDay(startDate);
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
