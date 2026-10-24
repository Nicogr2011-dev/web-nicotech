import type { AuthUser } from "@/lib/AuthContext";

export type PlanId = AuthUser["tier"];

export type Plan = {
  id: PlanId;
  slug: string;
  name: string;
  accent: string;
  tagline: string;
  /** null = plan gratuito (Básico) */
  priceYearly: number | null;
  priceMonthly: number | null;
  /** Máximo de suscripciones activas; null = ilimitadas. Mantener en sync con TIER_LIMITS en api/_bootstrap.php. */
  subscriptionLimit: number | null;
  features: string[];
};

/** Último día en que se ofrece el plan Básico gratuito (YYYY-MM-DD); el panel lo anuncia hasta entonces. */
export const FREE_PLAN_ENDS_ON = "2027-03-08";

/** Meses para volver a un plan mayor al bajar a uno cuyo límite superas (LIMIT_GRACE_MONTHS en el backend). */
export const LIMIT_GRACE_MONTHS = 3;

export const PLANS: Plan[] = [
  {
    id: "BASICO",
    slug: "basico",
    name: "Básico",
    accent: "#2ec4b6",
    tagline: "Para empezar a organizarte",
    priceYearly: null,
    priceMonthly: null,
    subscriptionLimit: 3,
    features: ["Todas las funciones de Nicotech", "Hasta 3 suscripciones a la vez"],
  },
  {
    id: "PREMIUM",
    slug: "premium",
    name: "Premium",
    accent: "#8338ec",
    tagline: "Sin límites de suscripciones",
    priceYearly: 30,
    priceMonthly: 3,
    subscriptionLimit: null,
    features: ["Todas las funciones de Nicotech", "Suscripciones ilimitadas"],
  },
  {
    id: "PREMIUM_LITE",
    slug: "premium-lite",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "Un punto intermedio, más barato",
    priceYearly: 15,
    priceMonthly: 1.5,
    subscriptionLimit: 7,
    features: ["Todas las funciones de Nicotech", "Hasta 7 suscripciones a la vez"],
  },
];

export function getPlanBySlug(slug: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.slug === slug);
}

/** Formatea un precio en euros, sin decimales de sobra (ej. 1.5 -> "1,50 €", 30 -> "30 €"). */
export function formatPrice(value: number): string {
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `${value.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} €`;
}

/** % que te ahorras pagando anual en vez de mes a mes, redondeado. Null si el plan es gratis. */
export function getYearlySavingsPercent(plan: Plan): number | null {
  if (plan.priceYearly == null || plan.priceMonthly == null || plan.priceMonthly <= 0) return null;
  const yearlyIfMonthly = plan.priceMonthly * 12;
  return Math.round(((yearlyIfMonthly - plan.priceYearly) / yearlyIfMonthly) * 100);
}
