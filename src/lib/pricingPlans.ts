import type { AuthUser } from "@/lib/AuthContext";

export type PlanId = AuthUser["tier"];

export type Plan = {
  id: PlanId;
  name: string;
  accent: string;
  tagline: string;
  /** null = plan gratuito (Básico) */
  priceYearly: number | null;
  priceMonthly: number | null;
  /** En V1 solo Básico se puede elegir; los de pago se muestran como no disponibles (llegan con V2). */
  available: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "BASICO",
    name: "Básico",
    accent: "#2ec4b6",
    tagline: "Todo Nicotech, gratis",
    priceYearly: null,
    priceMonthly: null,
    available: true,
    features: ["Todas las funciones de Nicotech", "Suscripciones ilimitadas", "Sin publicidad"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    accent: "#8338ec",
    tagline: "No disponible por ahora",
    priceYearly: 30,
    priceMonthly: 3,
    available: false,
    features: [],
  },
  {
    id: "PREMIUM_LITE",
    name: "Premium Lite",
    accent: "#3a86ff",
    tagline: "No disponible por ahora",
    priceYearly: 15,
    priceMonthly: 1.5,
    available: false,
    features: [],
  },
];

/** Formatea un precio en euros, sin decimales de sobra (ej. 1.5 -> "1,50 €", 30 -> "30 €"). */
export function formatPrice(value: number): string {
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `${value.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} €`;
}
