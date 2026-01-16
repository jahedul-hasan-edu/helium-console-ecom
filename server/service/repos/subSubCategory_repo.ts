import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { subSubCategories } from "server/db/schemas/subSubCategories";
import { CreateSubSubCategoryDTO, GetSubSubCategoriesOptions, GetSubSubCategoriesResponse, UpdateSubSubCategoryDTO, SubSubCategoryResponseDTO } from "server/shared/dtos/SubSubCategory";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUB_SUB_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/subSubCategoryMessages";

export interface IStorageSubSubCategory {
  // SubSubCategories
  getSubSubCategories(tenantId: string, options?: GetSubSubCategoriesOptions): Promise<GetSubSubCategoriesResponse>;
  getSubSubCategory(id: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined>;
  getSubSubCategoryBySlug(slug: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined>;
  createSubSubCategory(subSubCategory: CreateSubSubCategoryDTO & { tenantId: string; userIp: string }): Promise<SubSubCategoryResponseDTO>;
  updateSubSubCategory(id: string, tenantId: string, updates: UpdateSubSubCategoryDTO & { userIp: string }): Promise<SubSubCategoryResponseDTO>;
  deleteSubSubCategory(id: string, tenantId: string): Promise<void>;
}

export class StorageSubSubCategory implements IStorageSubSubCategory {
  // SubSubCategories
  async getSubSubCategories(tenantId: string, options?: GetSubSubCategoriesOptions): Promise<GetSubSubCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || SUB_SUB_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with tenant filter and search
    const baseQuery = search
      ? db.select().from(subSubCategories).where(
          and(
            eq(subSubCategories.tenantId, tenantId),
            sql`${subSubCategories.name} ILIKE ${"%"+search+"%"} OR ${subSubCategories.slug} ILIKE ${"%"+search+"%"}`
          )
        )
      : db.select().from(subSubCategories).where(eq(subSubCategories.tenantId, tenantId));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = 
      sortBy === SUB_SUB_CATEGORY_SORT_FIELDS.NAME ? subSubCategories.name :
      sortBy === SUB_SUB_CATEGORY_SORT_FIELDS.SLUG ? subSubCategories.slug :
      subSubCategories.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getSubSubCategory(id: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    const [subSubCategory] = await db.select().from(subSubCategories).where(
      and(
        eq(subSubCategories.id, id),
        eq(subSubCategories.tenantId, tenantId)
      )
    );
    return subSubCategory;
  }

  async getSubSubCategoryBySlug(slug: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    const [subSubCategory] = await db.select().from(subSubCategories).where(
      and(
        eq(subSubCategories.slug, slug),
        eq(subSubCategories.tenantId, tenantId)
      )
    );
    return subSubCategory;
  }

  async createSubSubCategory(insertSubSubCategory: CreateSubSubCategoryDTO & { tenantId: string; userIp: string }): Promise<SubSubCategoryResponseDTO> {
    const [subSubCategory] = await db.insert(subSubCategories).values({
      tenantId: insertSubSubCategory.tenantId,
      subCategoryId: insertSubSubCategory.subCategoryId,
      name: insertSubSubCategory.name,
      slug: insertSubSubCategory.slug,
      userIp: insertSubSubCategory.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();

    return subSubCategory;
  }

  async updateSubSubCategory(id: string, tenantId: string, updates: UpdateSubSubCategoryDTO & { userIp: string }): Promise<SubSubCategoryResponseDTO> {
    const [subSubCategory] = await db.update(subSubCategories)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(
        and(
          eq(subSubCategories.id, id),
          eq(subSubCategories.tenantId, tenantId)
        )
      )
      .returning();

    return subSubCategory;
  }

  async deleteSubSubCategory(id: string, tenantId: string): Promise<void> {
    await db.delete(subSubCategories).where(
      and(
        eq(subSubCategories.id, id),
        eq(subSubCategories.tenantId, tenantId)
      )
    );
  }
}

export const storageSubSubCategory = new StorageSubSubCategory();
