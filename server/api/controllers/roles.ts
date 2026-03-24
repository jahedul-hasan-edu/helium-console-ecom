import type { Express } from "express";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { api } from "../routes/roleRoute";
import { rbacService } from "server/service/rbac_service";

export async function registerRoleRoutes(app: Express): Promise<void> {
  app.get(
    api.roles.list.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.getRoles(req);
      ResponseHandler.list(res, response, "Roles retrieved successfully", HTTP_STATUS.OK);
    })
  );

  app.post(
    api.roles.create.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.createRole(req);
      ResponseHandler.success(res, "Role created successfully", response, HTTP_STATUS.CREATED);
    })
  );

  app.patch(
    api.roles.update.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.updateRole(req.params.id, req);
      ResponseHandler.success(res, "Role updated successfully", response, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.roles.delete.path,
    asyncHandler(async (req, res) => {
      await rbacService.deleteRole(req.params.id, req);
      ResponseHandler.success(res, "Role deleted successfully", null, HTTP_STATUS.OK);
    })
  );
}