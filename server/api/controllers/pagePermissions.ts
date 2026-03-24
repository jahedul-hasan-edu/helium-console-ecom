import type { Express } from "express";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { api } from "../routes/pagePermissionRoute";
import { rbacService } from "server/service/rbac_service";

export async function registerPagePermissionRoutes(app: Express): Promise<void> {
  app.get(
    api.pagePermissions.get.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.getPagePermissions(req.params.roleId, req);
      ResponseHandler.success(res, "Page permissions retrieved successfully", response, HTTP_STATUS.OK);
    })
  );

  app.put(
    api.pagePermissions.update.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.updatePagePermissions(req.params.roleId, req);
      ResponseHandler.success(res, "Page permissions updated successfully", response, HTTP_STATUS.OK);
    })
  );
}