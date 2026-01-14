import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  mainCategoryId: uuid("main_category_id"),
  name: text("name"),
  slug: text("slug"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertCategorySchema = createInsertSchema(categories);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
