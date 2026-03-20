import { Request } from "express";
import { storageHomeSetting } from "./repos/homeSetting_repo";
import { homeSettingImageService } from "./homeSetting_image_service";
import { CreateHomeSettingDTO, GetHomeSettingsOptions, UpdateHomeSettingDTO } from "server/shared/dtos/HomeSetting";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { HOME_SETTING_SORT_FIELDS } from "server/shared/constants/feature/homeSettingMessages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";
const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

export const homeSettingService = {
  async getHomeSettings(req: Request) {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || HOME_SETTING_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
      
    const options: GetHomeSettingsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };
    
    return await storageHomeSetting.getHomeSettings(tenantId, options);
  },

  async getHomeSetting(id: string, tenantId: string) {
    return await storageHomeSetting.getHomeSetting(id, tenantId);
  },

  async createHomeSetting(req: Request) {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const data: CreateHomeSettingDTO = req.body;
    const userId = (req as any).user?.id;
    
    // Check for duplicate title
    const isDuplicate = await storageHomeSetting.checkDuplicateTitle(data.title, tenantId);
    if (isDuplicate) {
      throw new Error("Home Setting with this title already exists for this tenant");
    }
    
    // Create the home setting
    const homeSetting = await storageHomeSetting.createHomeSetting({ ...data, tenantId, userIp });
    
    console.log("req.files:", (req as any).files);
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
      await homeSettingImageService.uploadHomeSettingImages(
        homeSetting.id,
        files.map(f => f.buffer),
        userId,
        userIp
      );
    }
    
    return homeSetting;
  },

  async updateHomeSetting(id: string, req: Request) {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const updates: UpdateHomeSettingDTO = req.body;
    const userId = (req as any).user?.id;
    
    // Get existing home setting
    const existing = await storageHomeSetting.getHomeSetting(id, tenantId);
    if (!existing) {
      throw new Error("Home Setting not found");
    }
    
    // Check for duplicate title if title is being changed
    if (updates.title && updates.title !== existing.title) {
      const isDuplicate = await storageHomeSetting.checkDuplicateTitle(updates.title, tenantId, id);
      if (isDuplicate) {
        throw new Error("Home Setting with this title already exists for this tenant");
      }
    }
    
    // Update the home setting
    const homeSetting = await storageHomeSetting.updateHomeSetting(id, tenantId, { ...updates, userIp });
    
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
      await homeSettingImageService.uploadHomeSettingImages(
        id,
        files.map(f => f.buffer),
        userId,
        userIp
      );
    }
    
    // Handle image deletions if deletion list is provided
    if (updates.imagesToDelete && Array.isArray(updates.imagesToDelete)) {
      for (const imageId of updates.imagesToDelete) {
        const image = existing.images?.find(img => img.id === imageId);
        if (image && image.imageUrl) {
          await homeSettingImageService.deleteHomeSettingImage(imageId, image.imageUrl);
        }
      }
    }
    
    return homeSetting;
  },

  async deleteHomeSetting(id: string, tenantId: string) {
    // Delete associated images from storage and database
    const homeSetting = await storageHomeSetting.getHomeSetting(id, tenantId);
    if (!homeSetting) {
      throw new Error("Home Setting not found");
    }
    
    // Delete images
    await homeSettingImageService.deleteHomeSettingImages(id);
    
    // Delete the home setting
    await storageHomeSetting.deleteHomeSetting(id, tenantId);
  },
};
