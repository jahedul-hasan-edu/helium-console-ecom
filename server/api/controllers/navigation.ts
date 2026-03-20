import type { Express } from "express";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { navigationService } from "server/service/navigation_service";

export async function registerNavigationRoutes(app: Express): Promise<void> {
  app.get(
    "/api/admin/navigation",
    asyncHandler(async (req, res) => {
      const navigation = await navigationService.getNavigation(req);
      ResponseHandler.list(res, navigation, "Navigation retrieved successfully", HTTP_STATUS.OK);
    })
  );
}