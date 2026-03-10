import type { Express, Request, Response } from "express";
import multer from "multer";
import { api } from "../routes/organizationRoute";
import { organizationService } from "../../service/organization_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { HTTP_STATUS, ORGANIZATION_MESSAGES } from "server/shared/constants";
import { createOrganizationSchema, updateOrganizationSchema } from "server/shared/dtos/Organization";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

export async function registerOrganizationRoutes(app: Express): Promise<void> {
  app.get(
    api.organizations.list.path,
    asyncHandler(async (req, res) => {
      const response = await organizationService.getOrganizations(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        ORGANIZATION_MESSAGES.ORGANIZATIONS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.organizations.create.path,
    upload.single("image"),
    asyncHandler(async (req: Request, res: Response) => {
      const validationResult = createOrganizationSchema.safeParse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        logoTitle: req.body.logoTitle,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        socialFbUrl: req.body.socialFbUrl,
        socialInUrl: req.body.socialInUrl,
        socialXUrl: req.body.socialXUrl,
        socialUtubeUrl: req.body.socialUtubeUrl,
        license: req.body.license,
        privacyPolicy: req.body.privacyPolicy,
        returnPolicy: req.body.returnPolicy,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      });

      if (!validationResult.success) {
        return ResponseHandler.error(
          res,
          ORGANIZATION_MESSAGES.INVALID_ORGANIZATION_DATA,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues.map((issue) => issue.message)
        );
      }

      req.body = validationResult.data;

      const organization = await organizationService.createOrganization(req);

      ResponseHandler.success(
        res,
        ORGANIZATION_MESSAGES.ORGANIZATION_CREATED_SUCCESSFULLY,
        organization,
        HTTP_STATUS.CREATED
      );
    })
  );

  app.get(
    api.organizations.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = (req.query.tenantId as string) || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      const organization = await organizationService.getOrganization(req.params.id, tenantId);

      if (!organization) {
        return ResponseHandler.error(
          res,
          ORGANIZATION_MESSAGES.ORGANIZATION_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      ResponseHandler.success(
        res,
        ORGANIZATION_MESSAGES.ORGANIZATION_RETRIEVED_SUCCESSFULLY,
        organization,
        HTTP_STATUS.OK
      );
    })
  );

  app.patch(
    api.organizations.update.path,
    upload.single("image"),
    asyncHandler(async (req: Request, res: Response) => {
      const validationResult = updateOrganizationSchema.safeParse({
        tenantId: req.body.tenantId,
        title: req.body.title,
        logoTitle: req.body.logoTitle,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        socialFbUrl: req.body.socialFbUrl,
        socialInUrl: req.body.socialInUrl,
        socialXUrl: req.body.socialXUrl,
        socialUtubeUrl: req.body.socialUtubeUrl,
        license: req.body.license,
        privacyPolicy: req.body.privacyPolicy,
        returnPolicy: req.body.returnPolicy,
        isActive:
          req.body.isActive === undefined
            ? undefined
            : req.body.isActive === "true" || req.body.isActive === true,
        removeImage:
          req.body.removeImage === undefined
            ? undefined
            : req.body.removeImage === "true" || req.body.removeImage === true,
      });

      if (!validationResult.success) {
        return ResponseHandler.error(
          res,
          ORGANIZATION_MESSAGES.INVALID_ORGANIZATION_DATA,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues.map((issue) => issue.message)
        );
      }

      req.body = validationResult.data;

      const organization = await organizationService.updateOrganization(req.params.id, req);

      ResponseHandler.success(
        res,
        ORGANIZATION_MESSAGES.ORGANIZATION_UPDATED_SUCCESSFULLY,
        organization,
        HTTP_STATUS.OK
      );
    })
  );

  app.delete(
    api.organizations.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = (req.query.tenantId as string) || "0027d5b0-9a89-48f0-95fd-2228294ff053";

      await organizationService.deleteOrganization(req.params.id, tenantId);

      ResponseHandler.success(
        res,
        ORGANIZATION_MESSAGES.ORGANIZATION_DELETED_SUCCESSFULLY,
        null,
        HTTP_STATUS.OK
      );
    })
  );
}