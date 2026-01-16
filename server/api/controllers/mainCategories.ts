import type { Express } from "express";
import { mainCategoryService } from "../../service/mainCategory_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/mainCategoryRoute";
import { HTTP_STATUS, MAIN_CATEGORY_MESSAGES } from "server/shared/constants";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

export async function registerMainCategoryRoutes(app: Express): Promise<void> {
  app.get(
    api.mainCategories.list.path,
    asyncHandler(async (req, res) => {
      const response = await mainCategoryService.getMainCategories(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        MAIN_CATEGORY_MESSAGES.MAIN_CATEGORIES_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/main-categories/check-slug",
    asyncHandler(async (req, res) => {
      const slug = req.query.slug as string;
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      
      if (!slug) {
        return ResponseHandler.error(res, "Slug is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingMainCategory = await mainCategoryService.checkSlugExists(slug, tenantId);
      
      ResponseHandler.success(
        res,
        "Slug check completed",
        { exists: !!existingMainCategory, mainCategory: existingMainCategory || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.mainCategories.create.path,
    asyncHandler(async (req, res) => {
      const mainCategory = await mainCategoryService.createMainCategory(req);
      ResponseHandler.success(res, MAIN_CATEGORY_MESSAGES.MAIN_CATEGORY_CREATED_SUCCESSFULLY, mainCategory, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.mainCategories.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      const mainCategory = await mainCategoryService.getMainCategory(req.params.id, tenantId);
      if (!mainCategory) {
        return ResponseHandler.error(res, MAIN_CATEGORY_MESSAGES.MAIN_CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, MAIN_CATEGORY_MESSAGES.MAIN_CATEGORY_RETRIEVED_SUCCESSFULLY, mainCategory, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.mainCategories.update.path,
    asyncHandler(async (req, res) => {
      const mainCategory = await mainCategoryService.updateMainCategory(req.params.id, req.body, req);
      ResponseHandler.success(res, MAIN_CATEGORY_MESSAGES.MAIN_CATEGORY_UPDATED_SUCCESSFULLY, mainCategory, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.mainCategories.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      await mainCategoryService.deleteMainCategory(req.params.id, tenantId);
      ResponseHandler.success(res, MAIN_CATEGORY_MESSAGES.MAIN_CATEGORY_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
