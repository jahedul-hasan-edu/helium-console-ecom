import type { Express } from "express";
import { api } from "../routes/orderRoute";
import { orderService } from "../../service/order_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { HTTP_STATUS, ORDER_MESSAGES } from "server/shared/constants";
import { createOrderSchema, updateOrderSchema } from "server/shared/dtos/Order";

export async function registerOrderRoutes(app: Express): Promise<void> {
  app.get(
    api.orders.list.path,
    asyncHandler(async (req, res) => {
      const response = await orderService.getOrders(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        ORDER_MESSAGES.ORDERS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.orders.create.path,
    asyncHandler(async (req, res) => {
      const validationResult = createOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        return ResponseHandler.error(
          res,
          ORDER_MESSAGES.INVALID_ORDER_DATA,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues.map((issue) => issue.message)
        );
      }

      req.body = validationResult.data;

      const order = await orderService.createOrder(req);

      ResponseHandler.success(
        res,
        ORDER_MESSAGES.ORDER_CREATED_SUCCESSFULLY,
        order,
        HTTP_STATUS.CREATED
      );
    })
  );

  app.get(
    api.orders.get.path,
    asyncHandler(async (req, res) => {
      const tenantId = typeof req.query.tenantId === "string" ? req.query.tenantId : undefined;
      const order = await orderService.getOrder(req.params.id, tenantId);

      if (!order) {
        return ResponseHandler.error(res, ORDER_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(
        res,
        ORDER_MESSAGES.ORDER_RETRIEVED_SUCCESSFULLY,
        order,
        HTTP_STATUS.OK
      );
    })
  );

  app.patch(
    api.orders.update.path,
    asyncHandler(async (req, res) => {
      const validationResult = updateOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        return ResponseHandler.error(
          res,
          ORDER_MESSAGES.INVALID_ORDER_DATA,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues.map((issue) => issue.message)
        );
      }

      req.body = validationResult.data;

      const order = await orderService.updateOrder(req.params.id, req);

      ResponseHandler.success(
        res,
        ORDER_MESSAGES.ORDER_UPDATED_SUCCESSFULLY,
        order,
        HTTP_STATUS.OK
      );
    })
  );

  app.delete(
    api.orders.delete.path,
    asyncHandler(async (req, res) => {
      const tenantId = typeof req.query.tenantId === "string" ? req.query.tenantId : undefined;

      await orderService.deleteOrder(req.params.id, tenantId);

      ResponseHandler.success(
        res,
        ORDER_MESSAGES.ORDER_DELETED_SUCCESSFULLY,
        null,
        HTTP_STATUS.OK
      );
    })
  );
}