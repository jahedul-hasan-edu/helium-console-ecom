import { Request } from "express";
import { deleteImageFromSupabase, uploadImageToSupabase } from "server/shared/utils/supabaseStorage";
import { HTTP_STATUS } from "server/shared/constants/httpStatus";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { ORGANIZATION_MESSAGES, ORGANIZATION_SORT_FIELDS } from "server/shared/constants/feature/organizationMessages";
import { CreateOrganizationDTO, GetOrganizationsOptions, UpdateOrganizationDTO } from "server/shared/dtos/Organization";
import { storageOrganization } from "./repos/organization_repo";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";
const MAX_FILE_SIZE = 1024 * 1024;
const ORGANIZATION_STORAGE_PATH = "organizations";

type HttpError = Error & { statusCode?: number };

function createHttpError(message: string, statusCode: number): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

function getCurrentTenantId(req: Request): string {
  return extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId || (req.query.tenantId as string);
}

export const organizationService = {
  async getOrganizations(req: Request) {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || ORGANIZATION_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    const tenantId = getCurrentTenantId(req);

    const options: GetOrganizationsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return storageOrganization.getOrganizations(tenantId, options);
  },

  async getOrganization(id: string, tenantId: string) {
    return storageOrganization.getOrganization(id, tenantId);
  },

  async createOrganization(req: Request) {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId || (req.body.tenantId as string);
    const data: CreateOrganizationDTO = req.body;
    const userIp = getUserIp(req);
    const userId = (req as any).user?.id as string | undefined;
    const file = (req as any).file as Express.Multer.File | undefined;

    const isDuplicate = await storageOrganization.checkDuplicateTitle(data.title, tenantId);
    if (isDuplicate) {
      throw createHttpError(ORGANIZATION_MESSAGES.ORGANIZATION_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    if (file && file.size > MAX_FILE_SIZE) {
      throw createHttpError(ORGANIZATION_MESSAGES.INVALID_ORGANIZATION_IMAGE, HTTP_STATUS.BAD_REQUEST);
    }

    const organization = await storageOrganization.createOrganization({
      ...data,
      tenantId,
      userIp,
      createdBy: userId,
      updatedBy: userId,
    });

    if (!file) {
      return organization;
    }

    try {
      const uploadResult = await uploadImageToSupabase(
        file.buffer,
        organization.id,
        organization.id,
        ORGANIZATION_STORAGE_PATH
      );

      return await storageOrganization.updateOrganization(organization.id, tenantId, {
        imageUrl: uploadResult.imageUrl,
        userIp,
        updatedBy: userId,
      });
    } catch (error) {
      await storageOrganization.deleteOrganization(organization.id, tenantId);
      throw error;
    }
  },

  async updateOrganization(id: string, req: Request) {
    const currentTenantId = getCurrentTenantId(req);
    const updates: UpdateOrganizationDTO = req.body;
    const userIp = getUserIp(req);
    const userId = (req as any).user?.id as string | undefined;
    const file = (req as any).file as Express.Multer.File | undefined;

    const existingOrganization = await storageOrganization.getOrganization(id, currentTenantId);
    if (!existingOrganization) {
      throw createHttpError(ORGANIZATION_MESSAGES.ORGANIZATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const nextTenantId = updates.tenantId || existingOrganization.tenantId || currentTenantId;
    const nextTitle = updates.title || existingOrganization.title || "";
    const existingTitle = existingOrganization.title || "";

    if (
      nextTitle &&
      (nextTenantId !== currentTenantId || nextTitle.trim().toLowerCase() !== existingTitle.trim().toLowerCase())
    ) {
      const isDuplicate = await storageOrganization.checkDuplicateTitle(nextTitle, nextTenantId, id);
      if (isDuplicate) {
        throw createHttpError(ORGANIZATION_MESSAGES.ORGANIZATION_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }
    }

    let imageUrl = existingOrganization.imageUrl || null;

    if (updates.removeImage && imageUrl) {
      const currentFileName = imageUrl.split("/").pop();
      if (currentFileName) {
        await deleteImageFromSupabase(currentFileName, ORGANIZATION_STORAGE_PATH);
      }
      imageUrl = null;
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        throw createHttpError(ORGANIZATION_MESSAGES.INVALID_ORGANIZATION_IMAGE, HTTP_STATUS.BAD_REQUEST);
      }

      const uploadResult = await uploadImageToSupabase(
        file.buffer,
        id,
        id,
        ORGANIZATION_STORAGE_PATH
      );

      const previousFileName = existingOrganization.imageUrl?.split("/").pop();
      if (previousFileName && previousFileName !== uploadResult.fileName && !updates.removeImage) {
        await deleteImageFromSupabase(previousFileName, ORGANIZATION_STORAGE_PATH);
      }

      imageUrl = uploadResult.imageUrl;
    }

    return storageOrganization.updateOrganization(id, currentTenantId, {
      ...updates,
      imageUrl,
      userIp,
      updatedBy: userId,
    });
  },

  async deleteOrganization(id: string, tenantId: string) {
    const existingOrganization = await storageOrganization.getOrganization(id, tenantId);
    if (!existingOrganization) {
      throw createHttpError(ORGANIZATION_MESSAGES.ORGANIZATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (existingOrganization.imageUrl) {
      const fileName = existingOrganization.imageUrl.split("/").pop();
      if (fileName) {
        await deleteImageFromSupabase(fileName, ORGANIZATION_STORAGE_PATH);
      }
    }

    await storageOrganization.deleteOrganization(id, tenantId);
  },
};