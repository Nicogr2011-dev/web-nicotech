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
    features: ["Todas las funciones de Nicotech", "Con publicidad", "Hasta 20 suscripciones a la vez"],
  },
  {
    id: "PREMIUM",
    slug: "premium",
    name: "Premium",
    accent: "#8338ec",
    tagline: "Sin publicidad, sin límites",
    priceYearly: "10 €/año",
    priceMonthly: "1 €/mes",
    features: ["Todas las funciones de Nicotech", "Sin publicidad", "Suscripciones ilimitadas"],
  },
  {
    id: "PREMIUM_LITE",
    slug: "premium-lite",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "Sin límites, con publicidad",
    priceYearly: "5 €/año",
    priceMonthly: "0,5 €/mes",
    features: ["Todas las funciones de Nicotech", "Con publicidad", "Suscripciones ilimitadas"],
  },
];

export function getPlanBySlug(slug: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.slug === slug);
}
