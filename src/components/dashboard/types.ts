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
  verificationCode: string | null;
  verifiedAt: string | null;
  accentColor: string;
  nextChargeDate: string;
};
