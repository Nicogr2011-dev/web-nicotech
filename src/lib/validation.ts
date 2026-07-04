import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Introduce tu nombre").max(100),
  email: z.email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

export const ACCENT_COLORS = [
  "#FF5C5C",
  "#FFC93C",
  "#2EC4B6",
  "#3A86FF",
  "#8338EC",
  "#FF6FB5",
] as const;

export const subscriptionSchema = z.object({
  serviceName: z.string().trim().min(1, "Introduce el nombre del servicio").max(100),
  price: z.coerce.number().positive("El precio debe ser mayor que 0").max(1_000_000),
  currency: z.string().trim().length(3).default("EUR"),
  billingDay: z.coerce.number().int().min(1, "El día debe estar entre 1 y 31").max(31),
  startDate: z.coerce.date(),
  autoCancelAfterMonths: z
    .union([z.coerce.number().int().positive().max(120), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  accentColor: z.enum(ACCENT_COLORS),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
