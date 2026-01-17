import { Request, Response, Express } from "express";
import multer from "multer";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { productService } from "server/service/product_service";
import { productImageService } from "server/service/product_image_service";
import { PRODUCT_MESSAGES } from "server/shared/constants/feature/productMessages";
import { createProductSchema, updateProductSchema } from "server/shared/dtos/Product";
import { api } from "../routes/productRoute";
import { HTTP_STATUS } from "server/shared/constants/httpStatus";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

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

  // Create a new product with images
  app.post(
    api.products.create.path,
    upload.array("images", 10), // Allow up to 10 images
    asyncHandler(async (req: Request, res: Response) => {
      const validatedData = createProductSchema.parse(req.body);
      req.body = validatedData;
      const product = await productService.createProduct(req);
      return ResponseHandler.success(res, PRODUCT_MESSAGES.RECORD_CREATED, product, HTTP_STATUS.CREATED);
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

  // Update a product with images
  app.patch(
    api.products.update.path,
    upload.array("images", 10), // Allow up to 10 images
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

  // Get product images
  app.get(
    "/api/admin/products/:id/images",
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const images = await productImageService.getProductImages(id);
      return ResponseHandler.success(res, "Images retrieved successfully", images, HTTP_STATUS.OK);
    })
  );

  // Delete a specific product image
  app.delete(
    "/api/admin/products/images/:imageId",
    asyncHandler(async (req: Request, res: Response) => {
      const { imageId } = req.params;
      const imageUrl = req.body.imageUrl as string;
      
      if (!imageUrl) {
        return ResponseHandler.error(res, "Image URL is required", 400);
      }
      
      await productImageService.deleteProductImage(imageId, imageUrl);
      return ResponseHandler.success(res, "Image deleted successfully", null, HTTP_STATUS.OK);
    })
  );
}
