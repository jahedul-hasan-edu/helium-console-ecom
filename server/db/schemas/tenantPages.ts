import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pages } from "./pages";
import { tenants } from "./tenants";

export const tenantPages = pgTable(
  "tenant_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    tenantPageUniqueIdx: uniqueIndex("tenant_pages_tenant_page_unique_idx").on(table.tenantId, table.pageId),
    tenantPageTenantIdx: index("tenant_pages_tenant_idx").on(table.tenantId),
  })
);

export const insertTenantPageSchema = createInsertSchema(tenantPages);

export type TenantPage = typeof tenantPages.$inferSelect;
export type InsertTenantPage = typeof tenantPages.$inferInsert;