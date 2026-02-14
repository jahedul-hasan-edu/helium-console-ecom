import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow(),
  expiresOn: timestamp("expires_on", { withTimezone: true }).notNull(),
  revokedOn: timestamp("revoked_on", { withTimezone: true }),
  replacedByTokenId: uuid("replaced_by_token_id"),
  userIp: text("user_ip"),
  userAgent: text("user_agent"),
});
