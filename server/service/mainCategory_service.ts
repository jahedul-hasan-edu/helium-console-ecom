import { storageMainCategory } from "./repos/mainCategory_repo";
import { CreateMainCategoryDTO, GetMainCategoriesOptions, GetMainCategoriesResponse, UpdateMainCategoryDTO, MainCategoryResponseDTO } from "server/shared/dtos/MainCategory";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { MAIN_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/mainCategoryMessages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";

/**
 * Main Category Service
 * Handles all main category-related business logic
 * Acts as a bridge between controller and repository
 */
export class MainCategoryService {
  /**
   * Get main categories with pagination, sorting, and searching
   */
  async getMainCategories(req: Request): Promise<GetMainCategoriesResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || MAIN_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    
    const options: GetMainCategoriesOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageMainCategory.getMainCategories(tenantId, options);
  }

  /**
   * Get a single main category by ID
   */
  async getMainCategory(id: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined> {
    return await storageMainCategory.getMainCategory(id, tenantId);
  }

  /**
   * Check if a slug already exists for this tenant
   */
  async checkSlugExists(slug: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined> {
    return await storageMainCategory.getMainCategoryBySlug(slug, tenantId);
  }

  /**
   * Create a new main category
   */
  async createMainCategory(req: Request): Promise<MainCategoryResponseDTO> {
    const mainCategoryData: CreateMainCategoryDTO = req.body;
    const userIp = getUserIp(req);
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }

    return await storageMainCategory.createMainCategory({
      ...mainCategoryData,
      tenantId,
      userIp,
    });
  }

  /**
   * Update a main category
   */
  async updateMainCategory(id: string, updates: UpdateMainCategoryDTO, req: Request): Promise<MainCategoryResponseDTO> {
    const userIp = getUserIp(req);
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }

    return await storageMainCategory.updateMainCategory(id, tenantId, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a main category
   */
  async deleteMainCategory(id: string, tenantId: string): Promise<void> {
    return await storageMainCategory.deleteMainCategory(id, tenantId);
  }
}

export const mainCategoryService = new MainCategoryService();
