import { storageSubSubCategory } from "./repos/subSubCategory_repo";
import { CreateSubSubCategoryDTO, GetSubSubCategoriesOptions, GetSubSubCategoriesResponse, UpdateSubSubCategoryDTO, SubSubCategoryResponseDTO } from "server/shared/dtos/SubSubCategory";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUB_SUB_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/subSubCategoryMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

/**
 * SubSubCategory Service
 * Handles all sub-sub-category-related business logic
 * Acts as a bridge between controller and repository
 */
export class SubSubCategoryService {
  /**
   * Get sub-sub-categories with pagination, sorting, and searching
   */
  async getSubSubCategories(req: Request): Promise<GetSubSubCategoriesResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || SUB_SUB_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
    
    const options: GetSubSubCategoriesOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageSubSubCategory.getSubSubCategories(tenantId, options);
  }

  /**
   * Get a single sub-sub-category by ID
   */
  async getSubSubCategory(id: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    return await storageSubSubCategory.getSubSubCategory(id, tenantId);
  }

  /**
   * Check if a slug already exists for this tenant
   */
  async checkSlugExists(slug: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    return await storageSubSubCategory.getSubSubCategoryBySlug(slug, tenantId);
  }

  /**
   * Create a new sub-sub-category
   */
  async createSubSubCategory(req: Request): Promise<SubSubCategoryResponseDTO> {
    const subSubCategoryData: CreateSubSubCategoryDTO = req.body;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageSubSubCategory.createSubSubCategory({
      ...subSubCategoryData,
      tenantId,
      userIp,
    });
  }

  /**
   * Update a sub-sub-category
   */
  async updateSubSubCategory(id: string, updates: UpdateSubSubCategoryDTO, req: Request): Promise<SubSubCategoryResponseDTO> {
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageSubSubCategory.updateSubSubCategory(id, tenantId, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a sub-sub-category
   */
  async deleteSubSubCategory(id: string, tenantId: string): Promise<void> {
    return await storageSubSubCategory.deleteSubSubCategory(id, tenantId);
  }
}

export const subSubCategoryService = new SubSubCategoryService();
