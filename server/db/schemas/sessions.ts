import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
  lastActiveOn: timestamp("last_active_on", { withTimezone: true }),
  expiresOn: timestamp("expires_on", { withTimezone: true }).notNull(),
  revokedOn: timestamp("revoked_on", { withTimezone: true }),
  userIp: text("user_ip"),
  userAgent: text("user_agent"),
});
