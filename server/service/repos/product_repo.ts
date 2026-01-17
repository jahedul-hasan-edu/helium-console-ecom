import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { products } from "server/db/schemas/products";
import { subCategories } from "server/db/schemas/subCategories";
import { subSubCategories } from "server/db/schemas/subSubCategories";
import { CreateProductDTO, GetProductsOptions, GetProductsResponse, UpdateProductDTO, ProductResponseDTO } from "server/shared/dtos/Product";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { PRODUCT_SORT_FIELDS } from "server/shared/constants/feature/productMessages";

export interface IStorageProduct {
  // Products
  getProducts(tenantId: string, options?: GetProductsOptions): Promise<GetProductsResponse>;
  getProduct(id: string, tenantId: string): Promise<ProductResponseDTO | undefined>;
  createProduct(product: CreateProductDTO & { tenantId: string; userIp: string }): Promise<ProductResponseDTO>;
  updateProduct(id: string, tenantId: string, updates: UpdateProductDTO & { userIp: string }): Promise<ProductResponseDTO>;
  deleteProduct(id: string, tenantId: string): Promise<void>;
}

export class StorageProduct implements IStorageProduct {
  // Helper method to build product select query with joins
  private buildProductSelectQuery() {
    return db
      .select({
        id: products.id,
        tenantId: products.tenantId,
        subCategoryId: products.subCategoryId,
        subCategoryName: subCategories.name,
        subSubCategoryId: products.subSubCategoryId,
        subSubCategoryName: subSubCategories.name,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        isActive: products.isActive,
        createdBy: products.createdBy,
        updatedBy: products.updatedBy,
        createdOn: products.createdOn,
        updatedOn: products.updatedOn,
        userIp: products.userIp,
      })
      .from(products)
      .leftJoin(subCategories, eq(products.subCategoryId, subCategories.id))
      .leftJoin(subSubCategories, eq(products.subSubCategoryId, subSubCategories.id));
  }

  // Products
  async getProducts(tenantId: string, options?: GetProductsOptions): Promise<GetProductsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || PRODUCT_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with joins and tenant filter
    const whereConditions = search
      ? and(
          eq(products.tenantId, tenantId),
          sql`${products.name} ILIKE ${"%"+search+"%"} OR ${products.description} ILIKE ${"%"+search+"%"}`
        )
      : eq(products.tenantId, tenantId);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereConditions);
    const total = Number(countResult[0].count);

    // Apply sorting
    const sortColumn = 
      sortBy === PRODUCT_SORT_FIELDS.NAME ? products.name :
      sortBy === PRODUCT_SORT_FIELDS.PRICE ? products.price :
      sortBy === PRODUCT_SORT_FIELDS.STOCK ? products.stock :
      products.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination with joins
    const offset = (page - 1) * pageSize;
    const results = await this.buildProductSelectQuery()
      .where(whereConditions)
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    return {
      items: results,
      total,
      page,
      pageSize
    };
  }

  async getProduct(id: string, tenantId: string): Promise<ProductResponseDTO | undefined> {
    const [result] = await this.buildProductSelectQuery()
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);
    return result;
  }

  async createProduct(data: CreateProductDTO & { tenantId: string; userIp: string }): Promise<ProductResponseDTO> {
    const insertResult = await db.insert(products).values({
      tenantId: data.tenantId,
      subCategoryId: data.subCategoryId,
      subSubCategoryId: data.subSubCategoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      isActive: data.isActive,
      userIp: data.userIp,
      createdOn: new Date(),
    }).returning();
    
    const [created] = insertResult;
    
    // Fetch with subcategory and sub-subcategory names
    const [result] = await this.buildProductSelectQuery()
      .where(eq(products.id, created.id))
      .limit(1);
      
    return result!;
  }

  async updateProduct(id: string, tenantId: string, updates: UpdateProductDTO & { userIp: string }): Promise<ProductResponseDTO> {
    const updateResult = await db.update(products)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();
    
    if (updateResult.length === 0) {
      throw new Error("Product not found");
    }
    
    // Fetch with subcategory and sub-subcategory names
    const [result] = await this.buildProductSelectQuery()
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);
    
    return result!;
  }

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    const result = await db.delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Product not found");
    }
  }
}

export const storageProduct = new StorageProduct();
