import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const subSubCategories = pgTable("sub_sub_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  subCategoryId: uuid("sub_category_id"),
  name: text("name"),
  slug: text("slug"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertSubSubCategorySchema = createInsertSchema(subSubCategories);

export type SubSubCategory = typeof subSubCategories.$inferSelect;
export type InsertSubSubCategory = typeof subSubCategories.$inferInsert;
