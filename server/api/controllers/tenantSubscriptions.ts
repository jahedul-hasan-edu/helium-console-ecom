import type { Express } from "express";
import { tenantSubscriptionService } from "../../service/tenantSubscription_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/tenantSubscriptionRoute";
import { HTTP_STATUS } from "server/shared/constants";
import { TENANT_SUBSCRIPTION_MESSAGES } from "server/shared/constants/feature/tenantSubscriptionMessages";

export async function registerTenantSubscriptionRoutes(app: Express): Promise<void> {
  app.get(
    api.tenantSubscriptions.list.path,
    asyncHandler(async (req, res) => {
      const response = await tenantSubscriptionService.getTenantSubscriptions(req);

      ResponseHandler.paginated(
        res,
        response.data,
        response.pagination.totalRecords,
        response.pagination.currentPage,
        response.pagination.pageSize,
        TENANT_SUBSCRIPTION_MESSAGES.LIST_RETRIEVED,
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.tenantSubscriptions.create.path,
    asyncHandler(async (req, res) => {
      const subscription = await tenantSubscriptionService.createTenantSubscription(req);
      ResponseHandler.success(
        res,
        TENANT_SUBSCRIPTION_MESSAGES.CREATED,
        subscription,
        HTTP_STATUS.CREATED
      );
    })
  );

  app.get(
    api.tenantSubscriptions.get.path,
    asyncHandler(async (req, res) => {
      const subscription = await tenantSubscriptionService.getTenantSubscription(req.params.id);
      if (!subscription) {
        return ResponseHandler.error(
          res,
          TENANT_SUBSCRIPTION_MESSAGES.NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
      ResponseHandler.success(
        res,
        TENANT_SUBSCRIPTION_MESSAGES.RETRIEVED,
        subscription,
        HTTP_STATUS.OK
      );
    })
  );

  app.patch(
    api.tenantSubscriptions.update.path,
    asyncHandler(async (req, res) => {
      const subscription = await tenantSubscriptionService.updateTenantSubscription(
        req.params.id,
        req.body,
        req
      );
      ResponseHandler.success(
        res,
        TENANT_SUBSCRIPTION_MESSAGES.UPDATED,
        subscription,
        HTTP_STATUS.OK
      );
    })
  );

  app.delete(
    api.tenantSubscriptions.delete.path,
    asyncHandler(async (req, res) => {
      await tenantSubscriptionService.deleteTenantSubscription(req.params.id);
      ResponseHandler.success(res, TENANT_SUBSCRIPTION_MESSAGES.DELETED, null, HTTP_STATUS.OK);
    })
  );
}
