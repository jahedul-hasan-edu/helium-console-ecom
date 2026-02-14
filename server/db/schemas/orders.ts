import { pgTable, text, uuid, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  status: text("status"),
  address: text("address"),
  mobile: text("mobile"),
  email: text("email"),
  deliveryTime: text("delivery_time"),
  timeZone: text("time_zone"),
  reusableBag: boolean("reusable_bag").default(false),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertOrderSchema = createInsertSchema(orders);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
