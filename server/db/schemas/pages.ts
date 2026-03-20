import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon"),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    routePath: text("route_path").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    pageSlugUniqueIdx: uniqueIndex("pages_slug_unique_idx").on(table.slug),
    pageParentIdx: index("pages_parent_idx").on(table.parentId),
  })
);

export const insertPageSchema = createInsertSchema(pages);

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;