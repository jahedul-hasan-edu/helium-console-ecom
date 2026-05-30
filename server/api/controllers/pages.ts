import type { Express } from "express";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { api } from "../routes/pageRoute";
import { rbacService } from "server/service/rbac_service";

export async function registerPageRoutes(app: Express): Promise<void> {
  app.get(
    api.pages.list.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.getPages(req);
      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        "Pages retrieved successfully",
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.pages.create.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.createPage(req);
      ResponseHandler.success(res, "Page created successfully", response, HTTP_STATUS.CREATED);
    })
  );

  app.patch(
    api.pages.update.path,
    asyncHandler(async (req, res) => {
      const response = await rbacService.updatePage(req.params.id, req);
      ResponseHandler.success(res, "Page updated successfully", response, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.pages.delete.path,
    asyncHandler(async (req, res) => {
      await rbacService.deletePage(req.params.id, req);
      ResponseHandler.success(res, "Page deleted successfully", null, HTTP_STATUS.OK);
    })
  );
}