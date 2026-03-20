import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pages } from "./pages";
import { roles } from "./roles";
import { tenants } from "./tenants";

export const tenantRolePages = pgTable(
  "tenant_role_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    tenantRolePageUniqueIdx: uniqueIndex("tenant_role_pages_unique_idx").on(table.tenantId, table.roleId, table.pageId),
    tenantRolePageLookupIdx: index("tenant_role_pages_tenant_role_idx").on(table.tenantId, table.roleId),
  })
);

export const insertTenantRolePageSchema = createInsertSchema(tenantRolePages);

export type TenantRolePage = typeof tenantRolePages.$inferSelect;
export type InsertTenantRolePage = typeof tenantRolePages.$inferInsert;