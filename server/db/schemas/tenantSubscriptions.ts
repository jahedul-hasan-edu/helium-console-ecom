import { pgTable, text, uuid, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  planId: uuid("plan_id"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertTenantSubscriptionSchema = createInsertSchema(tenantSubscriptions);

export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type InsertTenantSubscription = typeof tenantSubscriptions.$inferInsert;
