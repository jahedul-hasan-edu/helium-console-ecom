import { Request } from "express";
import { storageProduct } from "./repos/product_repo";
import { CreateProductDTO, GetProductsOptions, UpdateProductDTO } from "server/shared/dtos/Product";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { PRODUCT_SORT_FIELDS } from "server/shared/constants/feature/productMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

export const productService = {
  async getProducts(req: Request) {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || PRODUCT_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
      
      // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = DEFAULT_TENANT_ID; // TODO: Extract from authenticated user
      
    const options: GetProductsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };
    
    return await storageProduct.getProducts(tenantId, options);
  },

  async getProduct(id: string, tenantId: string = DEFAULT_TENANT_ID) {
    return await storageProduct.getProduct(id, tenantId);
  },

  async createProduct(req: Request) {
    const tenantId = DEFAULT_TENANT_ID;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const data: CreateProductDTO = req.body;
    return await storageProduct.createProduct({ ...data, tenantId, userIp });
  },

  async updateProduct(id: string, req: Request) {
    const tenantId = DEFAULT_TENANT_ID;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const updates: UpdateProductDTO = req.body;
    return await storageProduct.updateProduct(id, tenantId, { ...updates, userIp });
  },

  async deleteProduct(id: string, tenantId: string = DEFAULT_TENANT_ID) {
    return await storageProduct.deleteProduct(id, tenantId);
  },
};
