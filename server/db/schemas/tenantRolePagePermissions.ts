import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pages } from "./pages";
import { roles } from "./roles";
import { tenants } from "./tenants";

export const tenantRolePagePermissions = pgTable(
  "tenant_role_page_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
    canView: boolean("can_view").notNull().default(false),
    canCreate: boolean("can_create").notNull().default(false),
    canUpdate: boolean("can_update").notNull().default(false),
    canDelete: boolean("can_delete").notNull().default(false),
    canPreview: boolean("can_preview").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    tenantRolePermissionUniqueIdx: uniqueIndex("tenant_role_page_permissions_unique_idx").on(table.tenantId, table.roleId, table.pageId),
    tenantRolePermissionLookupIdx: index("tenant_role_page_permissions_lookup_idx").on(table.tenantId, table.roleId, table.pageId),
  })
);

export const insertTenantRolePagePermissionSchema = createInsertSchema(tenantRolePagePermissions);

export type TenantRolePagePermission = typeof tenantRolePagePermissions.$inferSelect;
export type InsertTenantRolePagePermission = typeof tenantRolePagePermissions.$inferInsert;