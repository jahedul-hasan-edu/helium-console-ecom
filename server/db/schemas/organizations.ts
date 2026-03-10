import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id"),
    title: text("title"),
    logoTitle: text("logo_title"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    socialFbUrl: text("social_fb_url"),
    socialInUrl: text("social_in_url"),
    socialXUrl: text("social_x_url"),
    socialUtubeUrl: text("social_utube_url"),
    license: text("license"),
    privacyPolicy: text("privacy_policy"),
    returnPolicy: text("return_policy"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdOn: timestamp("created_on", { withTimezone: true }),
    updatedOn: timestamp("updated_on", { withTimezone: true }),
    userIp: text("user_ip"),
  },
  (table) => ({
    tenantIdx: index("organization_tenant_idx").on(table.tenantId),
    tenantTitleIdx: index("organization_tenant_title_idx").on(table.tenantId, table.title),
  })
);

export const insertOrganizationSchema = createInsertSchema(organizations);

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;