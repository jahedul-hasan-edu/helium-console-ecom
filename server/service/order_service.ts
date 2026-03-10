import { Request } from "express";
import { HTTP_STATUS } from "server/shared/constants/httpStatus";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { ORDER_MESSAGES, ORDER_SORT_FIELDS, type OrderSortField } from "server/shared/constants/feature/orderMessages";
import { CreateOrderDTO, GetOrdersOptions, UpdateOrderDTO } from "server/shared/dtos/Order";
import { storageOrder } from "./repos/order_repo";

type HttpError = Error & { statusCode?: number };

function createHttpError(message: string, statusCode: number): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

function getUserIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] || req.socket.remoteAddress || "";
  }
  return forwardedFor || req.socket.remoteAddress || "";
}

function getCurrentTenantId(req: Request): string | undefined {
  const tenantId = req.query.tenantId;
  return typeof tenantId === "string" && tenantId.trim() ? tenantId : undefined;
}

export const orderService = {
  async getOrders(req: Request) {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = ((req.query.sortBy as OrderSortField | undefined) ||
      ORDER_SORT_FIELDS.CREATED_ON) as OrderSortField;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    const tenantId = getCurrentTenantId(req);

    const options: GetOrdersOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      tenantId,
    };

    return storageOrder.getOrders(options);
  },

  async getOrder(id: string, tenantId?: string) {
    return storageOrder.getOrder(id, tenantId);
  },

  async createOrder(req: Request) {
    const data = req.body as CreateOrderDTO;
    const userIp = getUserIp(req);
    const userId = (req as any).user?.id as string | undefined;

    return storageOrder.createOrder({
      ...data,
      userIp,
      createdBy: userId,
      updatedBy: userId,
    });
  },

  async updateOrder(id: string, req: Request) {
    const tenantId = getCurrentTenantId(req);
    const updates = req.body as UpdateOrderDTO;
    const userIp = getUserIp(req);
    const userId = (req as any).user?.id as string | undefined;

    const existingOrder = await storageOrder.getOrder(id, tenantId);
    if (!existingOrder) {
      throw createHttpError(ORDER_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return storageOrder.updateOrder(
      id,
      {
        ...updates,
        userIp,
        updatedBy: userId,
      },
      tenantId
    );
  },

  async deleteOrder(id: string, tenantId?: string) {
    const existingOrder = await storageOrder.getOrder(id, tenantId);
    if (!existingOrder) {
      throw createHttpError(ORDER_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await storageOrder.deleteOrder(id, tenantId);
  },
};