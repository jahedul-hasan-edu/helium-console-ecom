import { Request, Response, Express } from "express";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { productService } from "server/service/product_service";
import { PRODUCT_MESSAGES } from "server/shared/constants/feature/productMessages";
import { createProductSchema, updateProductSchema } from "server/shared/dtos/Product";
import { api } from "../routes/productRoute";
import { HTTP_STATUS } from "server/shared/constants/httpStatus";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

export function registerProductRoutes(app: Express) {
  // Get all products with pagination
  app.get(
    api.products.list.path,
    asyncHandler(async (req: Request, res: Response) => {
      const response = await productService.getProducts(req);
      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        PRODUCT_MESSAGES.RECORDS_RETRIEVED,
        HTTP_STATUS.OK
      );
    })
  );

  // Create a new product
  app.post(
    api.products.create.path,
    asyncHandler(async (req: Request, res: Response) => {
      const validatedData = createProductSchema.parse(req.body);
      req.body = validatedData;
      const product = await productService.createProduct(req);
      return ResponseHandler.success(res, PRODUCT_MESSAGES.RECORD_CREATED,product , HTTP_STATUS.CREATED);
    })
  );

  // Get a single product by ID
  app.get(
    api.products.get.path,
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const product = await productService.getProduct(id, DEFAULT_TENANT_ID);
      
      if (!product) {
        return ResponseHandler.error(res, PRODUCT_MESSAGES.RECORD_NOT_FOUND, 404);
      }
      
      return ResponseHandler.success(res, PRODUCT_MESSAGES.RECORD_RETRIEVED, product, HTTP_STATUS.OK);
    })
  );

  // Update a product
  app.patch(
    api.products.update.path,
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);
      req.body = validatedData;
      const product = await productService.updateProduct(id, req);
      return ResponseHandler.success(res, PRODUCT_MESSAGES.RECORD_UPDATED, product, HTTP_STATUS.OK);
    })
  );

  // Delete a product
  app.delete(
    api.products.delete.path,
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      await productService.deleteProduct(id, DEFAULT_TENANT_ID);
      return ResponseHandler.success(res, PRODUCT_MESSAGES.RECORD_DELETED, null, HTTP_STATUS.OK);
    })
  );
}
