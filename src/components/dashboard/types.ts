export type SubscriptionView = {
  id: string;
  serviceName: string;
  price: number;
  currency: string;
  billingDay: number;
  startDate: string;
  autoCancelAfterMonths: number | null;
  cancelDate: string | null;
  status: "ACTIVE" | "CANCELLED";
  accentColor: string;
  nextChargeDate: string;
};
