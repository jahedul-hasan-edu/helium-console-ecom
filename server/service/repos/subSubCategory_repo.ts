import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { subSubCategories } from "server/db/schemas/subSubCategories";
import { subCategories } from "server/db/schemas/subCategories";
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
  // Helper method to build subSubCategory select query with joins
  private buildSubSubCategorySelectQuery() {
    return db
      .select({
        id: subSubCategories.id,
        tenantId: subSubCategories.tenantId,
        subCategoryId: subSubCategories.subCategoryId,
        subCategoryName: subCategories.name,
        name: subSubCategories.name,
        slug: subSubCategories.slug,
        createdBy: subSubCategories.createdBy,
        updatedBy: subSubCategories.updatedBy,
        createdOn: subSubCategories.createdOn,
        updatedOn: subSubCategories.updatedOn,
        userIp: subSubCategories.userIp,
      })
      .from(subSubCategories)
      .leftJoin(subCategories, eq(subSubCategories.subCategoryId, subCategories.id));
  }

  // SubSubCategories
  async getSubSubCategories(tenantId: string, options?: GetSubSubCategoriesOptions): Promise<GetSubSubCategoriesResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || SUB_SUB_CATEGORY_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with joins and tenant filter
    const whereConditions = search
      ? and(
          eq(subSubCategories.tenantId, tenantId),
          sql`${subSubCategories.name} ILIKE ${"%"+search+"%"} OR ${subSubCategories.slug} ILIKE ${"%"+search+"%"}`
        )
      : eq(subSubCategories.tenantId, tenantId);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subSubCategories)
      .where(whereConditions);
    const total = Number(countResult[0].count);

    // Apply sorting
    const sortColumn = 
      sortBy === SUB_SUB_CATEGORY_SORT_FIELDS.NAME ? subSubCategories.name :
      sortBy === SUB_SUB_CATEGORY_SORT_FIELDS.SLUG ? subSubCategories.slug :
      subSubCategories.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination with joins
    const offset = (page - 1) * pageSize;
    const results = await this.buildSubSubCategorySelectQuery()
      .where(whereConditions)
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    return {
      items: results,
      total,
      page,
      pageSize,
    };
  }

  async getSubSubCategory(id: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    const [result] = await this.buildSubSubCategorySelectQuery()
      .where(and(eq(subSubCategories.id, id), eq(subSubCategories.tenantId, tenantId)))
      .limit(1);
    return result;
  }

  async getSubSubCategoryBySlug(slug: string, tenantId: string): Promise<SubSubCategoryResponseDTO | undefined> {
    const [result] = await this.buildSubSubCategorySelectQuery()
      .where(and(eq(subSubCategories.slug, slug), eq(subSubCategories.tenantId, tenantId)))
      .limit(1);
    return result;
  }

  async createSubSubCategory(insertSubSubCategory: CreateSubSubCategoryDTO & { tenantId: string; userIp: string }): Promise<SubSubCategoryResponseDTO> {
    const [created] = await db.insert(subSubCategories).values({
      tenantId: insertSubSubCategory.tenantId,
      subCategoryId: insertSubSubCategory.subCategoryId,
      name: insertSubSubCategory.name,
      slug: insertSubSubCategory.slug,
      userIp: insertSubSubCategory.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();
    
    // Fetch with subcategory name
    const [result] = await this.buildSubSubCategorySelectQuery()
      .where(eq(subSubCategories.id, created.id))
      .limit(1);
      
    return result!;
  }

  async updateSubSubCategory(id: string, tenantId: string, updates: UpdateSubSubCategoryDTO & { userIp: string }): Promise<SubSubCategoryResponseDTO> {
    const [updated] = await db.update(subSubCategories)
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
    
    if (!updated) {
      throw new Error("SubSubCategory not found");
    }
    
    // Fetch with subcategory name
    const [result] = await this.buildSubSubCategorySelectQuery()
      .where(and(eq(subSubCategories.id, id), eq(subSubCategories.tenantId, tenantId)))
      .limit(1);
    
    return result!;
  }

  async deleteSubSubCategory(id: string, tenantId: string): Promise<void> {
    const result = await db.delete(subSubCategories).where(
      and(
        eq(subSubCategories.id, id),
        eq(subSubCategories.tenantId, tenantId)
      )
    ).returning();
    
    if (result.length === 0) {
      throw new Error("SubSubCategory not found");
    }
  }
}

export const storageSubSubCategory = new StorageSubSubCategory();
