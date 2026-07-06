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
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "BASICO",
    slug: "basico",
    name: "Básico",
    accent: "#2ec4b6",
    tagline: "Para empezar a organizarte",
    priceYearly: null,
    priceMonthly: null,
    features: ["Todas las funciones de Nicotech", "Hasta 3 suscripciones a la vez"],
  },
  {
    id: "PREMIUM",
    slug: "premium",
    name: "Premium",
    accent: "#8338ec",
    tagline: "Sin límites de suscripciones",
    priceYearly: 10,
    priceMonthly: 1,
    features: ["Todas las funciones de Nicotech", "Suscripciones ilimitadas"],
  },
  {
    id: "PREMIUM_LITE",
    slug: "premium-lite",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "Un punto intermedio, más barato",
    priceYearly: 8,
    priceMonthly: 0.7,
    features: ["Todas las funciones de Nicotech", "Hasta 7 suscripciones a la vez"],
  },
];

export function getPlanBySlug(slug: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.slug === slug);
}

/** Formatea un precio en euros, sin decimales de sobra (ej. 0.7 -> "0,70 €", 10 -> "10 €"). */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

/** % que te ahorras pagando anual en vez de mes a mes, redondeado. Null si el plan es gratis. */
export function getYearlySavingsPercent(plan: Plan): number | null {
  if (plan.priceYearly == null || plan.priceMonthly == null || plan.priceMonthly <= 0) return null;
  const yearlyIfMonthly = plan.priceMonthly * 12;
  return Math.round(((yearlyIfMonthly - plan.priceYearly) / yearlyIfMonthly) * 100);
}
