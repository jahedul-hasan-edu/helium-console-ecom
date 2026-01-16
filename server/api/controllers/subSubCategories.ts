import type { Express } from "express";
import { subSubCategoryService } from "../../service/subSubCategory_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { HTTP_STATUS, SUB_SUB_CATEGORY_MESSAGES } from "server/shared/constants";
import { api } from "../routes/subSubCategoryRoute";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

export async function registerSubSubCategoryRoutes(app: Express): Promise<void> {
  app.get(
    api.subSubCategories.list.path,
    asyncHandler(async (req, res) => {
      const response = await subSubCategoryService.getSubSubCategories(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORIES_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/sub-sub-categories/check-slug",
    asyncHandler(async (req, res) => {
      const slug = req.query.slug as string;
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      
      if (!slug) {
        return ResponseHandler.error(res, "Slug is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingSubSubCategory = await subSubCategoryService.checkSlugExists(slug, tenantId);
      
      ResponseHandler.success(
        res,
        "Slug check completed",
        { exists: !!existingSubSubCategory, subSubCategory: existingSubSubCategory || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.subSubCategories.create.path,
    asyncHandler(async (req, res) => {
      const subSubCategory = await subSubCategoryService.createSubSubCategory(req);
      ResponseHandler.success(res, SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORY_CREATED_SUCCESSFULLY, subSubCategory, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.subSubCategories.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      const subSubCategory = await subSubCategoryService.getSubSubCategory(req.params.id, tenantId);
      if (!subSubCategory) {
        return ResponseHandler.error(res, SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORY_RETRIEVED_SUCCESSFULLY, subSubCategory, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.subSubCategories.update.path,
    asyncHandler(async (req, res) => {
      const subSubCategory = await subSubCategoryService.updateSubSubCategory(req.params.id, req.body, req);
      ResponseHandler.success(res, SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORY_UPDATED_SUCCESSFULLY, subSubCategory, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.subSubCategories.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      await subSubCategoryService.deleteSubSubCategory(req.params.id, tenantId);
      ResponseHandler.success(res, SUB_SUB_CATEGORY_MESSAGES.SUB_SUB_CATEGORY_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
