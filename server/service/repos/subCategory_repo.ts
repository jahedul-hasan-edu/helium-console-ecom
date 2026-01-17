import { eq, desc, sql, asc, and, leftJoin } from "drizzle-orm";
import { db } from "server/db";
import { subCategories } from "server/db/schemas/subCategories";
import { categories } from "server/db/schemas/categories";
import { CreateSubCategoryDTO, GetSubCategoriesOptions, GetSubCategoriesResponse, UpdateSubCategoryDTO, SubCategoryResponseDTO } from "server/shared/dtos/SubCategory";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUB_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/subCategoryMessages";

export interface IStorageSubCategory {
  // SubCategories
  getSubCategories(tenantId: string, options?: GetSubCategoriesOptions): Promise<GetSubCategoriesResponse>;
  getSubCategory(id: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined>;
  getSubCategoryBySlug(slug: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined>;
  createSubCategory(subCategory: CreateSubCategoryDTO & { tenantId: string; userIp: string }): Promise<SubCategoryResponseDTO>;
  updateSubCategory(id: string, tenantId: string, updates: UpdateSubCategoryDTO & { userIp: string }): Promise<SubCategoryResponseDTO>;
  deleteSubCategory(id: string, tenantId: string): Promise<void>;
}

export class StorageSubCategory implements IStorageSubCategory {
  // Helper method to build subCategory select query with joins
  private buildSubCategorySelectQuery() {
    return db.select({
      id: subCategories.id,
      tenantId: subCategories.tenantId,
      categoryId: subCategories.categoryId,
      categoryName: categories.name,
      name: subCategories.name,
      slug: subCategories.slug,
      createdBy: subCategories.createdBy,
      updatedBy: subCategories.updatedBy,
      createdOn: subCategories.createdOn,
      updatedOn: subCategories.updatedOn,
      userIp: subCategories.userIp,
    })
    .from(subCategories)
    .leftJoin(categories, eq(subCategories.categoryId, categories.id));
  }

  // SubCategories
  async getSubCategories(tenantId: string, options?: GetSubCategoriesOptions): Promise<GetSubCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || SUB_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with tenant filter and search
    const baseQuery = search
      ? this.buildSubCategorySelectQuery().where(
          and(
            eq(subCategories.tenantId, tenantId),
            sql`${subCategories.name} ILIKE ${"%"+search+"%"} OR ${subCategories.slug} ILIKE ${"%"+search+"%"}`
          )
        )
      : this.buildSubCategorySelectQuery().where(eq(subCategories.tenantId, tenantId));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = 
      sortBy === SUB_CATEGORY_SORT_FIELDS.NAME ? subCategories.name :
      sortBy === SUB_CATEGORY_SORT_FIELDS.SLUG ? subCategories.slug :
      subCategories.createdOn;
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

  async getSubCategory(id: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined> {
    const [subCategory] = await this.buildSubCategorySelectQuery().where(
      and(
        eq(subCategories.id, id),
        eq(subCategories.tenantId, tenantId)
      )
    );
    return subCategory;
  }

  async getSubCategoryBySlug(slug: string, tenantId: string): Promise<SubCategoryResponseDTO | undefined> {
    const [subCategory] = await this.buildSubCategorySelectQuery().where(
      and(
        eq(subCategories.slug, slug),
        eq(subCategories.tenantId, tenantId)
      )
    );
    return subCategory;
  }

  async createSubCategory(insertSubCategory: CreateSubCategoryDTO & { tenantId: string; userIp: string }): Promise<SubCategoryResponseDTO> {
    const [insertedSubCategory] = await db.insert(subCategories).values({
      tenantId: insertSubCategory.tenantId,
      categoryId: insertSubCategory.categoryId,
      name: insertSubCategory.name,
      slug: insertSubCategory.slug,
      userIp: insertSubCategory.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();

    // Fetch the created subCategory with joined data
    const [subCategory] = await this.buildSubCategorySelectQuery().where(
      and(
        eq(subCategories.id, insertedSubCategory.id),
        eq(subCategories.tenantId, insertSubCategory.tenantId)
      )
    );

    return subCategory;
  }

  async updateSubCategory(id: string, tenantId: string, updates: UpdateSubCategoryDTO & { userIp: string }): Promise<SubCategoryResponseDTO> {
    const [updatedSubCategory] = await db.update(subCategories)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(
        and(
          eq(subCategories.id, id),
          eq(subCategories.tenantId, tenantId)
        )
      )
      .returning();

    // Fetch the updated subCategory with joined data
    const [subCategory] = await this.buildSubCategorySelectQuery().where(
      and(
        eq(subCategories.id, updatedSubCategory.id),
        eq(subCategories.tenantId, tenantId)
      )
    );

    return subCategory;
  }

  async deleteSubCategory(id: string, tenantId: string): Promise<void> {
    await db.delete(subCategories).where(
      and(
        eq(subCategories.id, id),
        eq(subCategories.tenantId, tenantId)
      )
    );
  }
}

export const storageSubCategory = new StorageSubCategory();
