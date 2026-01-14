import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const mainCategories = pgTable("main_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  name: text("name"),
  slug: text("slug"),
  orderIndex: integer("order_index"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertMainCategorySchema = createInsertSchema(mainCategories);

export type MainCategory = typeof mainCategories.$inferSelect;
export type InsertMainCategory = typeof mainCategories.$inferInsert;
