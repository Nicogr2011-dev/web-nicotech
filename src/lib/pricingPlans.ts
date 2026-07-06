import type { AuthUser } from "@/lib/AuthContext";

export type PlanId = AuthUser["tier"];

export type Plan = {
  id: PlanId;
  slug: string;
  name: string;
  accent: string;
  tagline: string;
  priceYearly: string;
  priceMonthly?: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "BASICO",
    slug: "basico",
    name: "Básico",
    accent: "#2ec4b6",
    tagline: "Para empezar a organizarte",
    priceYearly: "Gratis",
    features: ["Todas las funciones de Nicotech", "Hasta 3 suscripciones a la vez"],
  },
  {
    id: "PREMIUM",
    slug: "premium",
    name: "Premium",
    accent: "#8338ec",
    tagline: "Sin límites de suscripciones",
    priceYearly: "10 €/año",
    priceMonthly: "1 €/mes",
    features: ["Todas las funciones de Nicotech", "Suscripciones ilimitadas"],
  },
  {
    id: "PREMIUM_LITE",
    slug: "premium-lite",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "Un punto intermedio, más barato",
    priceYearly: "8 €/año",
    priceMonthly: "0,7 €/mes",
    features: ["Todas las funciones de Nicotech", "Hasta 7 suscripciones a la vez"],
  },
];

export function getPlanBySlug(slug: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.slug === slug);
}
