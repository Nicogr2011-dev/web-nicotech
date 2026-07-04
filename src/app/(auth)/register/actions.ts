"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "@/lib/password";
import { registerSchema } from "@/lib/validation";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerUser(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const passwordHash = await hash(parsed.data.password);
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
  });

  return { success: true };
}
