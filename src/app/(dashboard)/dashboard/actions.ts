"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validation";
import { computeCancelDate } from "@/lib/subscriptions";

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
    billingDay: formData.get("billingDay"),
    startDate: formData.get("startDate"),
    autoCancelAfterMonths: formData.get("autoCancelAfterMonths") ?? "",
    accentColor: formData.get("accentColor"),
  });
}

export async function createSubscription(formData: FormData) {
  const userId = await requireUserId();
  const data = parseSubscriptionForm(formData);
  const cancelDate = computeCancelDate(data.startDate, data.autoCancelAfterMonths);

  await prisma.subscription.create({
    data: { ...data, cancelDate, userId },
  });

  revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parseSubscriptionForm(formData);
  const cancelDate = computeCancelDate(data.startDate, data.autoCancelAfterMonths);

  await prisma.subscription.updateMany({
    where: { id, userId },
    data: { ...data, cancelDate },
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
