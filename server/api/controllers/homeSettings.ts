import type { Express, Request, Response } from "express";
import multer from "multer";
import { homeSettingService } from "../../service/homeSetting_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/homeSettingRoute";
import { HTTP_STATUS, HOME_SETTING_MESSAGES, HOME_SETTING_SORT_FIELDS } from "server/shared/constants";
import { createHomeSettingSchema, updateHomeSettingSchema } from "server/shared/dtos/HomeSetting";

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

export async function registerHomeSettingRoutes(app: Express): Promise<void> {
  // GET - List all Home Settings with pagination, sorting, and search
  app.get(
    api.homeSettings.list.path,
    asyncHandler(async (req, res) => {
      const response = await homeSettingService.getHomeSettings(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        HOME_SETTING_MESSAGES.HOME_SETTINGS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  // POST - Create a new Home Setting
  app.post(
    api.homeSettings.create.path,
    upload.array("images", 10), // Allow up to 10 images
    asyncHandler(async (req: Request, res: Response) => {
      // Validate the form fields from FormData
      const validatedData = createHomeSettingSchema.parse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        subTitle: req.body.subTitle,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      });
      req.body = validatedData;
      const homeSetting = await homeSettingService.createHomeSetting(req);
      ResponseHandler.success(res, HOME_SETTING_MESSAGES.HOME_SETTING_CREATED_SUCCESSFULLY, homeSetting, HTTP_STATUS.CREATED);
    })
  );

  // GET - Get a single Home Setting by ID
  app.get(
    api.homeSettings.get.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      const homeSetting = await homeSettingService.getHomeSetting(id, tenantId);

      if (!homeSetting) {
        return ResponseHandler.error(res, HOME_SETTING_MESSAGES.HOME_SETTING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, HOME_SETTING_MESSAGES.HOME_SETTING_RETRIEVED_SUCCESSFULLY, homeSetting, HTTP_STATUS.OK);
    })
  );

  // PATCH - Update a Home Setting
  app.patch(
    api.homeSettings.update.path,
    upload.array("images", 10), // Allow up to 10 images
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      
      // Validate the form fields from FormData
      const validatedData = updateHomeSettingSchema.parse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        subTitle: req.body.subTitle,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
        imagesToDelete: req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : undefined,
      });
      req.body = validatedData;
      
      const homeSetting = await homeSettingService.updateHomeSetting(id, req);

      if (!homeSetting) {
        return ResponseHandler.error(res, HOME_SETTING_MESSAGES.HOME_SETTING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, HOME_SETTING_MESSAGES.HOME_SETTING_UPDATED_SUCCESSFULLY, homeSetting, HTTP_STATUS.OK);
    })
  );

  // DELETE - Delete a Home Setting
  app.delete(
    api.homeSettings.delete.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      await homeSettingService.deleteHomeSetting(id, tenantId);

      ResponseHandler.success(res, HOME_SETTING_MESSAGES.HOME_SETTING_DELETED_SUCCESSFULLY, { success: true }, HTTP_STATUS.OK);
    })
  );
}
