import type { Express } from "express";
import type { Server } from "http";
import { registerUserRoutes } from "./api/controllers/users";
import { registerTenantRoutes } from "./api/controllers/tenants";
import { registerMainCategoryRoutes } from "./api/controllers/mainCategories";
import { registerCategoryRoutes } from "./api/controllers/categories";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register feature routes
  await registerUserRoutes(app);
  await registerTenantRoutes(app);
  await registerMainCategoryRoutes(app);
  await registerCategoryRoutes(app);

  return httpServer;
}
