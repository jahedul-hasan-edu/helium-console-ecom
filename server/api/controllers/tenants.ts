import type { Express } from "express";
import { tenantService } from "../../service/tenant_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/tenantRoute";
import { HTTP_STATUS, TENANT_MESSAGES } from "server/shared/constants";

export async function registerTenantRoutes(app: Express): Promise<void> {
  app.get(
    api.tenants.list.path,
    asyncHandler(async (req, res) => {
      const response = await tenantService.getTenants(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        TENANT_MESSAGES.TENANTS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/tenants/check-domain",
    asyncHandler(async (req, res) => {
      const domain = req.query.domain as string;
      
      if (!domain) {
        return ResponseHandler.error(res, "Domain is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingTenant = await tenantService.checkDomainExists(domain);
      
      ResponseHandler.success(
        res,
        "Domain check completed",
        { exists: !!existingTenant, tenant: existingTenant || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.tenants.create.path,
    asyncHandler(async (req, res) => {
      const tenant = await tenantService.createTenant(req);
      ResponseHandler.success(res, TENANT_MESSAGES.TENANT_CREATED_SUCCESSFULLY, tenant, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.tenants.get.path,
    asyncHandler(async (req, res) => {
      const tenant = await tenantService.getTenant(req.params.id);
      if (!tenant) {
        return ResponseHandler.error(res, TENANT_MESSAGES.TENANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, TENANT_MESSAGES.TENANT_RETRIEVED_SUCCESSFULLY, tenant, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.tenants.update.path,
    asyncHandler(async (req, res) => {
      const tenant = await tenantService.updateTenant(req.params.id, req.body, req);
      ResponseHandler.success(res, TENANT_MESSAGES.TENANT_UPDATED_SUCCESSFULLY, tenant, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.tenants.delete.path,
    asyncHandler(async (req, res) => {
      await tenantService.deleteTenant(req.params.id);
      ResponseHandler.success(res, TENANT_MESSAGES.TENANT_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
