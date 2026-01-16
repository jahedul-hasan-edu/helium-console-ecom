import { storageCategory } from "./repos/category_repo";
import { CreateCategoryDTO, GetCategoriesOptions, GetCategoriesResponse, UpdateCategoryDTO, CategoryResponseDTO } from "server/shared/dtos/Category";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/categoryMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

/**
 * Category Service
 * Handles all category-related business logic
 * Acts as a bridge between controller and repository
 */
export class CategoryService {
  /**
   * Get categories with pagination, sorting, and searching
   */
  async getCategories(req: Request): Promise<GetCategoriesResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
    
    const options: GetCategoriesOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageCategory.getCategories(tenantId, options);
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    return await storageCategory.getCategory(id, tenantId);
  }

  /**
   * Check if a slug already exists for this tenant
   */
  async checkSlugExists(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    return await storageCategory.getCategoryBySlug(slug, tenantId);
  }

  /**
   * Create a new category
   */
  async createCategory(req: Request): Promise<CategoryResponseDTO> {
    const categoryData: CreateCategoryDTO = req.body;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageCategory.createCategory({
      ...categoryData,
      tenantId,
      userIp,
    });
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, updates: UpdateCategoryDTO, req: Request): Promise<CategoryResponseDTO> {
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user

    return await storageCategory.updateCategory(id, tenantId, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string, tenantId: string): Promise<void> {
    return await storageCategory.deleteCategory(id, tenantId);
  }
}

export const categoryService = new CategoryService();
