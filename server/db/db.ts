import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("NEXT_PUBLIC_DATABASE_URL environment variable is not set");
}

// Create the connection
const client = postgres(databaseUrl);

// Create the drizzle instance
export const db = drizzle(client);
