import { pgTable, text, uuid, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id"),
    productId: uuid("product_id"),
    quantity: integer("quantity"),
    unit: text("unit"),
    price: text("price"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    cartProductUnique: uniqueIndex("cart_product_unique_idx").on(table.cartId, table.productId),
  })
);

// === SCHEMAS ===

export const insertCartItemSchema = createInsertSchema(cartItems);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
