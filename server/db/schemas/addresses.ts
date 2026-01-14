import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  city: text("city"),
  area: text("area"),
  addressDetails: text("address_details"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertAddressSchema = createInsertSchema(addresses);

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;
