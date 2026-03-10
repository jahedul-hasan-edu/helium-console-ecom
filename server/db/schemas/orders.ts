import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const orders = pgTable(
  "orders",
  {
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
  },
  (table) => ({
    tenantIdx: index("orders_tenant_idx").on(table.tenantId),
    statusIdx: index("orders_status_idx").on(table.status),
    createdOnIdx: index("orders_created_on_idx").on(table.createdOn),
    tenantCreatedOnIdx: index("orders_tenant_created_on_idx").on(table.tenantId, table.createdOn),
  })
);

// === SCHEMAS ===

export const insertOrderSchema = createInsertSchema(orders);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
