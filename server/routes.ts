import type { Express } from "express";
import type { Server } from "http";
import { registerUserRoutes } from "./api/controllers/users";
import { registerTenantRoutes } from "./api/controllers/tenants";
import { registerMainCategoryRoutes } from "./api/controllers/mainCategories";
import { registerCategoryRoutes } from "./api/controllers/categories";
import { registerSubCategoryRoutes } from "./api/controllers/subCategories";
import { registerSubSubCategoryRoutes } from "./api/controllers/subSubCategories";
import { registerProductRoutes } from "./api/controllers/products";
import { registerSubscriptionPlanRoutes } from "./api/controllers/subscriptionPlans";
import { registerTenantSubscriptionRoutes } from "./api/controllers/tenantSubscriptions";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register feature routes
  await registerUserRoutes(app);
  await registerTenantRoutes(app);
  await registerMainCategoryRoutes(app);
  await registerCategoryRoutes(app);
  await registerSubCategoryRoutes(app);
  await registerSubSubCategoryRoutes(app);
  await registerProductRoutes(app);
  await registerSubscriptionPlanRoutes(app);
  await registerTenantSubscriptionRoutes(app);

  return httpServer;
}
