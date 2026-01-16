import { storageSubCategory } from "./repos/subCategory_repo";
import { CreateSubCategoryDTO, GetSubCategoriesOptions, GetSubCategoriesResponse, UpdateSubCategoryDTO, SubCategoryResponseDTO } from "server/shared/dtos/SubCategory";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUB_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/subCategoryMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

/**
 * SubCategory Service
 * Handles all sub-category-related business logic
 * Acts as a bridge between controller and repository
 */
export class SubCategoryService {
  /**
   * Get sub-categories with pagination, sorting, and searching
   */
  async getSubCategories(req: Request): Promise<GetSubCategoriesResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || SUB_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
    
    const options: GetSubCategoriesOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageSubCategory.getSubCategories(tenantId, options);
  }

  /**
   * Get a single sub-category by ID
   */
  async getSubCategory(id: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined> {
    return await storageSubCategory.getSubCategory(id, tenantId);
  }

  /**
   * Check if a slug already exists for this tenant
   */
  async checkSlugExists(slug: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined> {
    return await storageSubCategory.getSubCategoryBySlug(slug, tenantId);
  }

  /**
   * Create a new sub-category
   */
  async createSubCategory(req: Request): Promise<SubCategoryResponseDTO> {
    const subCategoryData: CreateSubCategoryDTO = req.body;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageSubCategory.createSubCategory({
      ...subCategoryData,
      tenantId,
      userIp,
    });
  }

  /**
   * Update a sub-category
   */
  async updateSubCategory(id: string, updates: UpdateSubCategoryDTO, req: Request): Promise<SubCategoryResponseDTO> {
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageSubCategory.updateSubCategory(id, tenantId, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a sub-category
   */
  async deleteSubCategory(id: string, tenantId: string): Promise<void> {
    return await storageSubCategory.deleteSubCategory(id, tenantId);
  }
}

export const subCategoryService = new SubCategoryService();
