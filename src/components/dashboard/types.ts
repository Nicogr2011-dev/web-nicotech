export type SubscriptionView = {
  id: string;
  serviceName: string;
  price: number;
  currency: string;
  startDate: string;
  cancelDate: string | null;
  status: "ACTIVE" | "CANCELLED";
  cancelledAt: string | null;
  deletedAt: string | null;
  accentColor: string;
  nextChargeDate: string;
};
