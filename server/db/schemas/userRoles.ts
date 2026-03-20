import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { roles } from "./roles";
import { tenants } from "./tenants";
import { users } from "./users";

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    userRoleUniqueIdx: uniqueIndex("user_roles_user_tenant_unique_idx").on(table.userId, table.tenantId),
    userRoleLookupIdx: index("user_roles_user_idx").on(table.userId),
    userRoleTenantIdx: index("user_roles_tenant_idx").on(table.tenantId),
  })
);

export const insertUserRoleSchema = createInsertSchema(userRoles);

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;