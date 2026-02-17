import type { Express, Request, Response } from "express";
import multer from "multer";
import { popupAdService } from "../../service/popupAd_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/popupAdRoute";
import { HTTP_STATUS, POPUP_AD_MESSAGES, POPUP_AD_SORT_FIELDS } from "server/shared/constants";
import { createPopupAdSchema, updatePopupAdSchema } from "server/shared/dtos/PopupAd";

// Configure multer for single image upload
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

export async function registerPopupAdRoutes(app: Express): Promise<void> {
  // GET - List all Popup Ads with pagination, sorting, and search
  app.get(
    api.popupAds.list.path,
    asyncHandler(async (req, res) => {
      const response = await popupAdService.getPopupAds(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        POPUP_AD_MESSAGES.POPUP_ADS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  // POST - Create a new Popup Ad with image
  app.post(
    api.popupAds.create.path,
    upload.single("image"), // Single image upload
    asyncHandler(async (req: Request, res: Response) => {
      // Validate the form fields from FormData
      const validatedData = createPopupAdSchema.parse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      });
      req.body = validatedData;
      const popupAd = await popupAdService.createPopupAd(req);
      ResponseHandler.success(res, POPUP_AD_MESSAGES.POPUP_AD_CREATED_SUCCESSFULLY, popupAd, HTTP_STATUS.CREATED);
    })
  );

  // GET - Get a single Popup Ad by ID
  app.get(
    api.popupAds.get.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      const popupAd = await popupAdService.getPopupAd(id, tenantId);

      if (!popupAd) {
        return ResponseHandler.error(res, POPUP_AD_MESSAGES.POPUP_AD_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, POPUP_AD_MESSAGES.POPUP_AD_RETRIEVED_SUCCESSFULLY, popupAd, HTTP_STATUS.OK);
    })
  );

  // PATCH - Update a Popup Ad with image
  app.patch(
    api.popupAds.update.path,
    upload.single("image"), // Single image upload
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      
      // Validate the form fields from FormData
      const validatedData = updatePopupAdSchema.parse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
        removeImage: req.body.removeImage === "true" || req.body.removeImage === true,
      });
      req.body = validatedData;
      
      const popupAd = await popupAdService.updatePopupAd(id, req);

      if (!popupAd) {
        return ResponseHandler.error(res, POPUP_AD_MESSAGES.POPUP_AD_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, POPUP_AD_MESSAGES.POPUP_AD_UPDATED_SUCCESSFULLY, popupAd, HTTP_STATUS.OK);
    })
  );

  // DELETE - Delete a Popup Ad
  app.delete(
    api.popupAds.delete.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      await popupAdService.deletePopupAd(id, tenantId);
      ResponseHandler.success(res, POPUP_AD_MESSAGES.POPUP_AD_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
