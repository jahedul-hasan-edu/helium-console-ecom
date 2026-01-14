import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const subCategories = pgTable("sub_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  categoryId: uuid("category_id"),
  name: text("name"),
  slug: text("slug"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertSubCategorySchema = createInsertSchema(subCategories);

export type SubCategory = typeof subCategories.$inferSelect;
export type InsertSubCategory = typeof subCategories.$inferInsert;
