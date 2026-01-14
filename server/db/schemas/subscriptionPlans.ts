import { pgTable, text, uuid, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  price: numeric("price"),
  durationDays: integer("duration_days"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
