export type SubscriptionView = {
  id: string;
  serviceName: string;
  price: number;
  currency: string;
  startDate: string;
  cancelDate: string | null;
  status: "ACTIVE" | "CANCELLED";
  accentColor: string;
  nextChargeDate: string;
};
