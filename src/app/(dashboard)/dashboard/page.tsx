import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeNextChargeDate } from "@/lib/subscriptions";
import { SubscriptionsSection } from "@/components/dashboard/SubscriptionsSection";
import type { SubscriptionView } from "@/components/dashboard/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { billingDay: "asc" },
  });

  const views: SubscriptionView[] = subscriptions.map((s) => ({
    id: s.id,
    serviceName: s.serviceName,
    price: Number(s.price),
    currency: s.currency,
    billingDay: s.billingDay,
    startDate: s.startDate.toISOString(),
    autoCancelAfterMonths: s.autoCancelAfterMonths,
    cancelDate: s.cancelDate ? s.cancelDate.toISOString() : null,
    status: s.status,
    accentColor: s.accentColor,
    nextChargeDate: computeNextChargeDate(s.billingDay).toISOString(),
  }));

  const activeViews = views.filter((v) => v.status === "ACTIVE");
  const currency = activeViews[0]?.currency ?? "EUR";
  const monthlyTotal = activeViews.reduce((sum, v) => sum + v.price, 0);
  const scheduledCancellations = views.filter((v) => v.cancelDate).length;

  const nextChargeView = [...activeViews].sort(
    (a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime()
  )[0];
  const nextCharge = nextChargeView
    ? {
        serviceName: nextChargeView.serviceName,
        date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
          new Date(nextChargeView.nextChargeDate)
        ),
      }
    : null;

  return (
    <SubscriptionsSection
      subscriptions={views}
      monthlyTotal={monthlyTotal}
      currency={currency}
      nextCharge={nextCharge}
      scheduledCancellations={scheduledCancellations}
    />
  );
}
