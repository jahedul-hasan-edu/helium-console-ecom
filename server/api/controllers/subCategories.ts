import type { Express } from "express";
import { subCategoryService } from "../../service/subCategory_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { HTTP_STATUS, SUB_CATEGORY_MESSAGES } from "server/shared/constants";
import { api } from "../routes/subCategoryRoute";
import { extractTenantId, type AuthenticatedRequest } from "server/shared/utils/requestContext";

export async function registerSubCategoryRoutes(app: Express): Promise<void> {
  app.get(
    api.subCategories.list.path,
    asyncHandler(async (req, res) => {
      const response = await subCategoryService.getSubCategories(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        SUB_CATEGORY_MESSAGES.SUB_CATEGORIES_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/sub-categories/check-slug",
    asyncHandler(async (req, res) => {
      const slug = req.query.slug as string;
      const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
      if (!tenantId) {
        return ResponseHandler.error(res, "Tenant context is required", HTTP_STATUS.BAD_REQUEST);
      }
      
      if (!slug) {
        return ResponseHandler.error(res, "Slug is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingSubCategory = await subCategoryService.checkSlugExists(slug, tenantId);
      
      ResponseHandler.success(
        res,
        "Slug check completed",
        { exists: !!existingSubCategory, subCategory: existingSubCategory || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.subCategories.create.path,
    asyncHandler(async (req, res) => {
      const subCategory = await subCategoryService.createSubCategory(req);
      ResponseHandler.success(res, SUB_CATEGORY_MESSAGES.SUB_CATEGORY_CREATED_SUCCESSFULLY, subCategory, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.subCategories.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
      if (!tenantId) {
        return ResponseHandler.error(res, "Tenant context is required", HTTP_STATUS.BAD_REQUEST);
      }
      const subCategory = await subCategoryService.getSubCategory(req.params.id, tenantId);
      if (!subCategory) {
        return ResponseHandler.error(res, SUB_CATEGORY_MESSAGES.SUB_CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, SUB_CATEGORY_MESSAGES.SUB_CATEGORY_RETRIEVED_SUCCESSFULLY, subCategory, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.subCategories.update.path,
    asyncHandler(async (req, res) => {
      const subCategory = await subCategoryService.updateSubCategory(req.params.id, req.body, req);
      ResponseHandler.success(res, SUB_CATEGORY_MESSAGES.SUB_CATEGORY_UPDATED_SUCCESSFULLY, subCategory, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.subCategories.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
      if (!tenantId) {
        return ResponseHandler.error(res, "Tenant context is required", HTTP_STATUS.BAD_REQUEST);
      }
      await subCategoryService.deleteSubCategory(req.params.id, tenantId);
      ResponseHandler.success(res, SUB_CATEGORY_MESSAGES.SUB_CATEGORY_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
