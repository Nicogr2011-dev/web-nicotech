"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validation";

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user.id;
}

function parseSubscriptionForm(formData: FormData) {
  return subscriptionSchema.parse({
    serviceName: formData.get("serviceName"),
    price: formData.get("price"),
    currency: formData.get("currency") || "EUR",
    startDate: formData.get("startDate"),
    cancelDate: formData.get("cancelDate") ?? "",
    accentColor: formData.get("accentColor"),
  });
}

export async function createSubscription(formData: FormData) {
  const userId = await requireUserId();
  const data = parseSubscriptionForm(formData);

  await prisma.subscription.create({
    data: { ...data, userId },
  });

  revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parseSubscriptionForm(formData);

  await prisma.subscription.updateMany({
    where: { id, userId },
    data: { ...data },
  });

  revalidatePath("/dashboard");
}

export async function deleteSubscription(id: string) {
  const userId = await requireUserId();
  await prisma.subscription.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
}

export async function toggleSubscriptionStatus(id: string) {
  const userId = await requireUserId();
  const subscription = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!subscription) return;

  await prisma.subscription.update({
    where: { id },
    data: { status: subscription.status === "ACTIVE" ? "CANCELLED" : "ACTIVE" },
  });

  revalidatePath("/dashboard");
}
