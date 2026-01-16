import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { mainCategories } from "server/db/schemas/mainCategories";
import { CreateMainCategoryDTO, GetMainCategoriesOptions, GetMainCategoriesResponse, UpdateMainCategoryDTO, MainCategoryResponseDTO } from "server/shared/dtos/MainCategory";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { MAIN_CATEGORY_SORT_FIELDS } from "server/shared/constants/feature/mainCategoryMessages";

export interface IStorageMainCategory {
  // Main Categories
  getMainCategories(tenantId: string, options?: GetMainCategoriesOptions): Promise<GetMainCategoriesResponse>;
  getMainCategory(id: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined>;
  getMainCategoryBySlug(slug: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined>;
  createMainCategory(mainCategory: CreateMainCategoryDTO & { tenantId: string; userIp: string }): Promise<MainCategoryResponseDTO>;
  updateMainCategory(id: string, tenantId: string, updates: UpdateMainCategoryDTO & { userIp: string }): Promise<MainCategoryResponseDTO>;
  deleteMainCategory(id: string, tenantId: string): Promise<void>;
}

export class StorageMainCategory implements IStorageMainCategory {
  // Main Categories
  async getMainCategories(tenantId: string, options?: GetMainCategoriesOptions): Promise<GetMainCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || MAIN_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with tenant filter and search
    const baseQuery = search
      ? db.select().from(mainCategories).where(
          and(
            eq(mainCategories.tenantId, tenantId),
            sql`${mainCategories.name} ILIKE ${"%"+search+"%"} OR ${mainCategories.slug} ILIKE ${"%"+search+"%"}`
          )
        )
      : db.select().from(mainCategories).where(eq(mainCategories.tenantId, tenantId));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = 
      sortBy === MAIN_CATEGORY_SORT_FIELDS.NAME ? mainCategories.name :
      sortBy === MAIN_CATEGORY_SORT_FIELDS.SLUG ? mainCategories.slug :
      sortBy === MAIN_CATEGORY_SORT_FIELDS.ORDER_INDEX ? mainCategories.orderIndex :
      mainCategories.createdOn;
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

  async getMainCategory(id: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined> {
    const [mainCategory] = await db.select().from(mainCategories).where(
      and(
        eq(mainCategories.id, id),
        eq(mainCategories.tenantId, tenantId)
      )
    );
    return mainCategory;
  }

  async getMainCategoryBySlug(slug: string, tenantId: string): Promise<MainCategoryResponseDTO | undefined> {
    const [mainCategory] = await db.select().from(mainCategories).where(
      and(
        eq(mainCategories.slug, slug),
        eq(mainCategories.tenantId, tenantId)
      )
    );
    return mainCategory;
  }

  async createMainCategory(insertMainCategory: CreateMainCategoryDTO & { tenantId: string; userIp: string }): Promise<MainCategoryResponseDTO> {
    const [mainCategory] = await db.insert(mainCategories).values({
      tenantId: insertMainCategory.tenantId,
      name: insertMainCategory.name,
      slug: insertMainCategory.slug,
      orderIndex: insertMainCategory.orderIndex,
      userIp: insertMainCategory.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();

    return mainCategory;
  }

  async updateMainCategory(id: string, tenantId: string, updates: UpdateMainCategoryDTO & { userIp: string }): Promise<MainCategoryResponseDTO> {
    const [mainCategory] = await db.update(mainCategories)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(
        and(
          eq(mainCategories.id, id),
          eq(mainCategories.tenantId, tenantId)
        )
      )
      .returning();

    return mainCategory;
  }

  async deleteMainCategory(id: string, tenantId: string): Promise<void> {
    await db.delete(mainCategories).where(
      and(
        eq(mainCategories.id, id),
        eq(mainCategories.tenantId, tenantId)
      )
    );
  }
}

export const storageMainCategory = new StorageMainCategory();
