import { pgTable, text, uuid, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  subCategoryId: uuid("sub_category_id"),
  subSubCategoryId: uuid("sub_sub_category_id"),
  name: text("name"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  unit: text("unit"),
  stock: integer("stock"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertProductSchema = createInsertSchema(products);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
