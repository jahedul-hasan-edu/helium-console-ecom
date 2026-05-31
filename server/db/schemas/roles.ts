import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { tenants } from "./tenants";

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    roleNameUniqueIdx: uniqueIndex("roles_name_unique_idx").on(table.name),
  })
);

export const insertRoleSchema = createInsertSchema(roles);

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;