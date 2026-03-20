import { Request } from "express";
import { storagePopupAd } from "./repos/popupAd_repo";
import { CreatePopupAdDTO, GetPopupAdsOptions, UpdatePopupAdDTO } from "server/shared/dtos/PopupAd";
import { uploadImageToSupabase, deleteImageFromSupabase } from "server/shared/utils/supabaseStorage";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { POPUP_AD_SORT_FIELDS } from "server/shared/constants/feature/popupAdMessages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";
const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

export const popupAdService = {
  async getPopupAds(req: Request) {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || POPUP_AD_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
      
    // Extract tenant ID from request (adjust based on auth implementation)
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
      
    const options: GetPopupAdsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };
    
    return await storagePopupAd.getPopupAds(tenantId, options);
  },

  async getPopupAd(id: string, tenantId: string) {
    return await storagePopupAd.getPopupAd(id, tenantId);
  },

  async createPopupAd(req: Request) {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const data: CreatePopupAdDTO = req.body;
    const userId = (req as any).user?.id; // Extract from authenticated user context
    
    // Check for duplicate title
    const isDuplicate = await storagePopupAd.checkDuplicateTitle(data.title, tenantId);
    if (isDuplicate) {
      throw new Error("Popup Ad with this title already exists for this tenant");
    }

    let imageUrl: string | undefined;

    // Handle image upload if file is provided
    if ((req as any).file) {
      const file = (req as any).file as Express.Multer.File;
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.originalname} exceeds 1MB limit`);
      }

      // Create popup ad first to get ID
      const tempPopupAd = await storagePopupAd.createPopupAd({ 
        ...data, 
        tenantId,
        userIp,
      });

      // Upload the file to Supabase
      try {
        const uploadResult = await uploadImageToSupabase(
          file.buffer,
          tempPopupAd.id,
          tempPopupAd.id,
          "popup_ads"
        );
        imageUrl = uploadResult.imageUrl;

        // Update the popup ad with the actual image URL
        return await storagePopupAd.updatePopupAd(tempPopupAd.id, tenantId, {
          ...data,
          imageUrl,
          userIp,
        });
      } catch (error) {
        // Clean up the popup ad if image upload fails
        await storagePopupAd.deletePopupAd(tempPopupAd.id, tenantId);
        throw error;
      }
    }
    
    // Create without image
    return await storagePopupAd.createPopupAd({ 
      ...data, 
      tenantId,
      userIp,
    });
  },

  async updatePopupAd(id: string, req: Request) {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required");
    }
    const userIp = getUserIp(req);
    const updates: UpdatePopupAdDTO = req.body;
    const userId = (req as any).user?.id; // Extract from authenticated user context
    
    // Get the existing popup ad to verify tenant ownership
    const existingPopupAd = await storagePopupAd.getPopupAd(id, tenantId);
    if (!existingPopupAd) {
      throw new Error("Popup Ad not found");
    }

    // Check for duplicate title if title is being updated
    if (updates.title && updates.title !== existingPopupAd.title) {
      const isDuplicate = await storagePopupAd.checkDuplicateTitle(updates.title, tenantId, id);
      if (isDuplicate) {
        throw new Error("Popup Ad with this title already exists for this tenant");
      }
    }

    let imageUrl = existingPopupAd.imageUrl;

    // Handle image removal
    if (updates.removeImage && existingPopupAd.imageUrl) {
      const fileName = existingPopupAd.imageUrl.split("/").pop();
      if (fileName) {
        await deleteImageFromSupabase(fileName);
      }
      imageUrl = null;
    }

    // Handle new image upload
    if ((req as any).file) {
      const file = (req as any).file as Express.Multer.File;
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.originalname} exceeds 1MB limit`);
      }

      // Delete old image if exists
      if (existingPopupAd.imageUrl) {
        const fileName = existingPopupAd.imageUrl.split("/").pop();
        if (fileName) {
          try {
            await deleteImageFromSupabase(fileName);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }

      // Upload new image
      const uploadResult = await uploadImageToSupabase(
        file.buffer,
        id,
        id,
        "popup_ads"
      );
      imageUrl = uploadResult.imageUrl;
    }

    // Update the popup ad
    return await storagePopupAd.updatePopupAd(id, tenantId, {
      ...updates,
      imageUrl,
      userIp,
    });
  },

  async deletePopupAd(id: string, tenantId: string) {
    // Get the popup ad to retrieve image URL
    const popupAd = await storagePopupAd.getPopupAd(id, tenantId);
    
    if (popupAd && popupAd.imageUrl) {
      // Delete image from Supabase
      const fileName = popupAd.imageUrl.split("/").pop();
      if (fileName) {
        try {
          await deleteImageFromSupabase(fileName);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    }

    // Delete from database
    await storagePopupAd.deletePopupAd(id, tenantId);
  },
};
