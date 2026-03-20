import type { Express } from "express";
import type { Server } from "http";
import { registerAuthRoutes } from "./api/controllers/auth";
import { registerUserRoutes } from "./api/controllers/users";
import { registerTenantRoutes } from "./api/controllers/tenants";
import { registerOrderRoutes } from "./api/controllers/orders";
import { registerOrganizationRoutes } from "./api/controllers/organizations";
import { registerMainCategoryRoutes } from "./api/controllers/mainCategories";
import { registerCategoryRoutes } from "./api/controllers/categories";
import { registerSubCategoryRoutes } from "./api/controllers/subCategories";
import { registerSubSubCategoryRoutes } from "./api/controllers/subSubCategories";
import { registerProductRoutes } from "./api/controllers/products";
import { registerSubscriptionPlanRoutes } from "./api/controllers/subscriptionPlans";
import { registerTenantSubscriptionRoutes } from "./api/controllers/tenantSubscriptions";
import { registerFaqRoutes } from "./api/controllers/faqs";
import { registerHomeSettingRoutes } from "./api/controllers/homeSettings";
import { registerPopupAdRoutes } from "./api/controllers/popupAds";
import { registerNavigationRoutes } from "./api/controllers/navigation";
import { authMiddleware } from "./shared/middleware/authMiddleware";
import { authorizationMiddleware } from "./shared/middleware/authorizationMiddleware";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await registerAuthRoutes(app);

  app.use("/api/admin", authMiddleware, authorizationMiddleware);

  await registerUserRoutes(app);
  await registerTenantRoutes(app);
  await registerOrderRoutes(app);
  await registerOrganizationRoutes(app);
  await registerMainCategoryRoutes(app);
  await registerCategoryRoutes(app);
  await registerSubCategoryRoutes(app);
  await registerSubSubCategoryRoutes(app);
  await registerProductRoutes(app);
  await registerSubscriptionPlanRoutes(app);
  await registerTenantSubscriptionRoutes(app);
  await registerFaqRoutes(app);
  await registerHomeSettingRoutes(app);
  await registerPopupAdRoutes(app);
  await registerNavigationRoutes(app);

  return httpServer;
}
