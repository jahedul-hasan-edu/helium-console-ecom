import type { Express } from "express";
import { categoryService } from "../../service/category_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/categoryRoute";
import { HTTP_STATUS, CATEGORY_MESSAGES } from "server/shared/constants";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

export async function registerCategoryRoutes(app: Express): Promise<void> {
  app.get(
    api.categories.list.path,
    asyncHandler(async (req, res) => {
      const response = await categoryService.getCategories(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        CATEGORY_MESSAGES.CATEGORIES_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/categories/check-slug",
    asyncHandler(async (req, res) => {
      const slug = req.query.slug as string;
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      
      if (!slug) {
        return ResponseHandler.error(res, "Slug is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingCategory = await categoryService.checkSlugExists(slug, tenantId);
      
      ResponseHandler.success(
        res,
        "Slug check completed",
        { exists: !!existingCategory, category: existingCategory || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.categories.create.path,
    asyncHandler(async (req, res) => {
      const category = await categoryService.createCategory(req);
      ResponseHandler.success(res, CATEGORY_MESSAGES.CATEGORY_CREATED_SUCCESSFULLY, category, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.categories.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      const category = await categoryService.getCategory(req.params.id, tenantId);
      if (!category) {
        return ResponseHandler.error(res, CATEGORY_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, CATEGORY_MESSAGES.CATEGORY_RETRIEVED_SUCCESSFULLY, category, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.categories.update.path,
    asyncHandler(async (req, res) => {
      const category = await categoryService.updateCategory(req.params.id, req.body, req);
      ResponseHandler.success(res, CATEGORY_MESSAGES.CATEGORY_UPDATED_SUCCESSFULLY, category, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.categories.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      await categoryService.deleteCategory(req.params.id, tenantId);
      ResponseHandler.success(res, CATEGORY_MESSAGES.CATEGORY_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
