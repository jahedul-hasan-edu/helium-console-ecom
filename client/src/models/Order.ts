import { QueryParams } from "@/lib/interface";

export interface Order {
  id: string;
  tenantId: string | null;
  status: string | null;
  address: string | null;
  mobile: string | null;
  email: string | null;
  deliveryTime: string | null;
  timeZone: string | null;
  reusableBag: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateOrderRequest {
  tenantId: string;
  status: string;
  address?: string;
  mobile?: string;
  email?: string;
  deliveryTime?: string;
  timeZone?: string;
  reusableBag?: boolean;
}

export interface UpdateOrderRequest {
  tenantId?: string;
  status?: string;
  address?: string;
  mobile?: string;
  email?: string;
  deliveryTime?: string;
  timeZone?: string;
  reusableBag?: boolean;
}

export interface GetOrdersParams extends QueryParams {
  tenantId?: string;
}