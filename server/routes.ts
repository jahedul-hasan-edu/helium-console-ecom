import type { Express } from "express";
import type { Server } from "http";
import { registerUserRoutes } from "./api/controllers/users";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register feature routes
  await registerUserRoutes(app);

  return httpServer;
}
