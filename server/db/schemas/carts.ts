import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  userId: uuid("user_id"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertCartSchema = createInsertSchema(carts);

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;
