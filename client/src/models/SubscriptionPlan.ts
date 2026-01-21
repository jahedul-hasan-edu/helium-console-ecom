export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  durationDays: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  price: string;
  durationDays: number;
}

export interface UpdateSubscriptionPlanRequest {
  name: string;
  price: string;
  durationDays: number;
}

export interface SubscriptionPlanResponse extends SubscriptionPlan {}
