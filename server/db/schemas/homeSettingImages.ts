import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const homeSettingImages = pgTable("home_setting_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeSettingId: uuid("home_setting_id"),
  imageUrl: text("image_url"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertHomeSettingImageSchema = createInsertSchema(homeSettingImages);

export type HomeSettingImage = typeof homeSettingImages.$inferSelect;
export type InsertHomeSettingImage = typeof homeSettingImages.$inferInsert;
