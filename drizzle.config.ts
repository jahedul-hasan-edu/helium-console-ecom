import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("NEXT_PUBLIC_DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
