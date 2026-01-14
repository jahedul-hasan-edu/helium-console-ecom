import { pgTable, text, uuid, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id"),
  method: text("method"),
  status: text("status"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertPaymentSchema = createInsertSchema(payments);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
