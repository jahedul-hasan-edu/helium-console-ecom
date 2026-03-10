import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { orders } from "../../db/schemas/orders";
import { OrderSortField } from "../constants/feature/orderMessages";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = () => z.string().trim().max(500, "Value is too long").optional();
const optionalEmail = z
  .union([z.string().trim().email("Valid email is required"), z.literal("")])
  .optional();

export const orderSchema = createInsertSchema(orders);

export const createOrderSchema = z
  .object({
    tenantId: z.string().uuid("Invalid tenant ID"),
    status: requiredText("Order status is required").max(50, "Order status must be 50 characters or less"),
    address: optionalText(),
    mobile: optionalText(),
    email: optionalEmail,
    deliveryTime: optionalText(),
    timeZone: optionalText(),
    reusableBag: z.boolean().default(false),
  })
  .strict();

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z
  .object({
    tenantId: z.string().uuid("Invalid tenant ID").optional(),
    status: requiredText("Order status is required")
      .max(50, "Order status must be 50 characters or less")
      .optional(),
    address: optionalText(),
    mobile: optionalText(),
    email: optionalEmail,
    deliveryTime: optionalText(),
    timeZone: optionalText(),
    reusableBag: z.boolean().optional(),
  })
  .strict();

export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>;

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  status: z.string().nullable(),
  address: z.string().nullable(),
  mobile: z.string().nullable(),
  email: z.string().nullable(),
  deliveryTime: z.string().nullable(),
  timeZone: z.string().nullable(),
  reusableBag: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type OrderResponseDTO = z.infer<typeof orderResponseSchema>;

export interface GetOrdersOptions extends PaginationOptions<OrderSortField> {
  tenantId?: string;
}

export type GetOrdersResponse = PaginationResponse<OrderResponseDTO>;