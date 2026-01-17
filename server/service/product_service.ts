import { Request } from "express";
import { storageProduct } from "./repos/product_repo";
import { productImageService } from "./product_image_service";
import { CreateProductDTO, GetProductsOptions, UpdateProductDTO } from "server/shared/dtos/Product";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { PRODUCT_SORT_FIELDS } from "server/shared/constants/feature/productMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";
const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

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
    const userId = (req as any).user?.id; // Extract from authenticated user context
    
    // Create the product
    const product = await storageProduct.createProduct({ ...data, tenantId, userIp });
    
    // Handle image uploads if files are provided
    if ((req as any).files && Array.isArray((req as any).files)) {
      const files = (req as any).files as Express.Multer.File[];
      
      // Validate file sizes
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.originalname} exceeds 1MB limit`);
        }
      }
      
      // Upload images
      await productImageService.uploadProductImages(
        product.id,
        files.map(f => f.buffer),
        userId,
        userIp
      );
    }
    
    return product;
  },

  async updateProduct(id: string, req: Request) {
    const tenantId = DEFAULT_TENANT_ID;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const updates: UpdateProductDTO = req.body;
    const userId = (req as any).user?.id; // Extract from authenticated user context
    
    // Update the product
    const product = await storageProduct.updateProduct(id, tenantId, { ...updates, userIp });
    
    // Handle image uploads if files are provided
    if ((req as any).files && Array.isArray((req as any).files)) {
      const files = (req as any).files as Express.Multer.File[];
      
      // Validate file sizes
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.originalname} exceeds 1MB limit`);
        }
      }
      
      // Upload new images
      await productImageService.uploadProductImages(
        id,
        files.map(f => f.buffer),
        userId,
        userIp
      );
    }
    
    // Handle image deletions if deletion list is provided
    if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
      for (const imageId of req.body.imagesToDelete) {
        await productImageService.deleteProductImage(imageId, ""); // Get URL from DB or pass it in body
      }
    }
    
    return product;
  },

  async deleteProduct(id: string, tenantId: string = DEFAULT_TENANT_ID) {
    // Delete all associated images
    await productImageService.deleteProductImages(id);
    
    // Delete the product
    await storageProduct.deleteProduct(id, tenantId);
  },
};
