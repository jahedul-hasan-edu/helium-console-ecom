import type { Express } from "express";
import { subscriptionPlanService } from "../../service/subscriptionPlan_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/subscriptionPlanRoute";
import {
  SUBSCRIPTION_PLAN_MESSAGES,
  HTTP_STATUS,
} from "server/shared/constants";

export async function registerSubscriptionPlanRoutes(
  app: Express
): Promise<void> {
  app.get(
    api.subscriptionPlans.list.path,
    asyncHandler(async (req, res) => {
      const response = await subscriptionPlanService.getSubscriptionPlans(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLANS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.subscriptionPlans.create.path,
    asyncHandler(async (req, res) => {
      const plan = await subscriptionPlanService.createSubscriptionPlan(req);
      ResponseHandler.success(
        res,
        SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLAN_CREATED_SUCCESSFULLY,
        plan,
        HTTP_STATUS.CREATED
      );
    })
  );

  app.get(
    api.subscriptionPlans.get.path,
    asyncHandler(async (req, res) => {
      const plan = await subscriptionPlanService.getSubscriptionPlan(
        req.params.id
      );
      if (!plan) {
        return ResponseHandler.error(
          res,
          SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLAN_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
      ResponseHandler.success(
        res,
        SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLAN_RETRIEVED_SUCCESSFULLY,
        plan,
        HTTP_STATUS.OK
      );
    })
  );

  app.patch(
    api.subscriptionPlans.update.path,
    asyncHandler(async (req, res) => {
      const plan = await subscriptionPlanService.updateSubscriptionPlan(
        req.params.id,
        req.body,
        req
      );
      ResponseHandler.success(
        res,
        SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLAN_UPDATED_SUCCESSFULLY,
        plan,
        HTTP_STATUS.OK
      );
    })
  );

  app.delete(
    api.subscriptionPlans.delete.path,
    asyncHandler(async (req, res) => {
      await subscriptionPlanService.deleteSubscriptionPlan(req.params.id);
      ResponseHandler.success(
        res,
        SUBSCRIPTION_PLAN_MESSAGES.SUBSCRIPTION_PLAN_DELETED_SUCCESSFULLY,
        null,
        HTTP_STATUS.OK
      );
    })
  );
}
