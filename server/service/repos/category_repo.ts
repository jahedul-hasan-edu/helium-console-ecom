import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { categories } from "server/db/schemas/categories";
import { mainCategories } from "server/db/schemas/mainCategories";
import { CreateCategoryDTO, GetCategoriesOptions, GetCategoriesResponse, UpdateCategoryDTO, CategoryResponseDTO } from "server/shared/dtos/Category";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/categoryMessages";

export interface IStorageCategory {
  // Categories
  getCategories(tenantId: string, options?: GetCategoriesOptions): Promise<GetCategoriesResponse>;
  getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined>;
  getCategoryBySlug(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined>;
  createCategory(category: CreateCategoryDTO & { tenantId: string; userIp: string }): Promise<CategoryResponseDTO>;
  updateCategory(id: string, tenantId: string, updates: UpdateCategoryDTO & { userIp: string }): Promise<CategoryResponseDTO>;
  deleteCategory(id: string, tenantId: string): Promise<void>;
}

export class StorageCategory implements IStorageCategory {
  // Helper method to build category select query with joins
  private buildCategorySelectQuery() {
    return db.select({
      id: categories.id,
      tenantId: categories.tenantId,
      mainCategoryId: categories.mainCategoryId,
      mainCategoryName: mainCategories.name,
      name: categories.name,
      slug: categories.slug,
      createdBy: categories.createdBy,
      updatedBy: categories.updatedBy,
      createdOn: categories.createdOn,
      updatedOn: categories.updatedOn,
      userIp: categories.userIp,
    })
    .from(categories)
    .leftJoin(mainCategories, eq(categories.mainCategoryId, mainCategories.id));
  }

  // Categories
  async getCategories(tenantId: string, options?: GetCategoriesOptions): Promise<GetCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with tenant filter and search
    const baseQuery = search
      ? this.buildCategorySelectQuery().where(
          and(
            eq(categories.tenantId, tenantId),
            sql`${categories.name} ILIKE ${"%"+search+"%"} OR ${categories.slug} ILIKE ${"%"+search+"%"}`
          )
        )
      : this.buildCategorySelectQuery().where(eq(categories.tenantId, tenantId));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = 
      sortBy === CATEGORY_SORT_FIELDS.NAME ? categories.name :
      sortBy === CATEGORY_SORT_FIELDS.SLUG ? categories.slug :
      categories.createdOn;
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

  async getCategory(id: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    const [category] = await this.buildCategorySelectQuery().where(
      and(
        eq(categories.id, id),
        eq(categories.tenantId, tenantId)
      )
    );
    return category;
  }

  async getCategoryBySlug(slug: string, tenantId: string): Promise<CategoryResponseDTO | undefined> {
    const [category] = await this.buildCategorySelectQuery().where(
      and(
        eq(categories.slug, slug),
        eq(categories.tenantId, tenantId)
      )
    );
    return category;
  }

  async createCategory(insertCategory: CreateCategoryDTO & { tenantId: string; userIp: string }): Promise<CategoryResponseDTO> {
    const [insertedCategory] = await db.insert(categories).values({
      tenantId: insertCategory.tenantId,
      mainCategoryId: insertCategory.mainCategoryId,
      name: insertCategory.name,
      slug: insertCategory.slug,
      userIp: insertCategory.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();

    // Fetch the created category with joined data
    const [category] = await this.buildCategorySelectQuery().where(
      and(
        eq(categories.id, insertedCategory.id),
        eq(categories.tenantId, insertCategory.tenantId)
      )
    );

    return category;
  }

  async updateCategory(id: string, tenantId: string, updates: UpdateCategoryDTO & { userIp: string }): Promise<CategoryResponseDTO> {
    const [updatedCategory] = await db.update(categories)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.tenantId, tenantId)
        )
      )
      .returning();

    // Fetch the updated category with joined data
    const [category] = await this.buildCategorySelectQuery().where(
      and(
        eq(categories.id, updatedCategory.id),
        eq(categories.tenantId, tenantId)
      )
    );

    return category;
  }

  async deleteCategory(id: string, tenantId: string): Promise<void> {
    await db.delete(categories).where(
      and(
        eq(categories.id, id),
        eq(categories.tenantId, tenantId)
      )
    );
  }
}

export const storageCategory = new StorageCategory();
