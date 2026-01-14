import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// === TABLE DEFINITIONS ===

export const deliverySlots = pgTable("delivery_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  slotTime: text("slot_time"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdOn: timestamp("created_on", { withTimezone: true }),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
  userIp: text("user_ip"),
});

// === SCHEMAS ===

export const insertDeliverySlotSchema = createInsertSchema(deliverySlots);

export type DeliverySlot = typeof deliverySlots.$inferSelect;
export type InsertDeliverySlot = typeof deliverySlots.$inferInsert;
