import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "server/db";
import { orderItems } from "server/db/schemas/orderItems";
import { orders } from "server/db/schemas/orders";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { ORDER_SORT_FIELDS } from "server/shared/constants/feature/orderMessages";
import {
  CreateOrderDTO,
  GetOrdersOptions,
  GetOrdersResponse,
  OrderResponseDTO,
  UpdateOrderDTO,
} from "server/shared/dtos/Order";

interface OrderMutationMetadata {
  userIp: string;
  createdBy?: string;
  updatedBy?: string;
}

function buildOrderIdentityCondition(id: string, tenantId?: string) {
  return tenantId ? and(eq(orders.id, id), eq(orders.tenantId, tenantId)) : eq(orders.id, id);
}

function buildOrderListCondition(tenantId?: string, search?: string) {
  const trimmedSearch = search?.trim();
  const searchCondition = trimmedSearch
    ? or(
        sql`${orders.id}::text ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.status} ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.address} ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.mobile} ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.email} ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.deliveryTime} ILIKE ${`%${trimmedSearch}%`}`,
        sql`${orders.timeZone} ILIKE ${`%${trimmedSearch}%`}`
      )
    : undefined;

  if (tenantId && searchCondition) {
    return and(eq(orders.tenantId, tenantId), searchCondition);
  }

  if (tenantId) {
    return eq(orders.tenantId, tenantId);
  }

  return searchCondition;
}

export interface IStorageOrder {
  getOrders(options?: GetOrdersOptions): Promise<GetOrdersResponse>;
  getOrder(id: string, tenantId?: string): Promise<OrderResponseDTO | undefined>;
  createOrder(data: CreateOrderDTO & OrderMutationMetadata): Promise<OrderResponseDTO>;
  updateOrder(
    id: string,
    updates: UpdateOrderDTO & OrderMutationMetadata,
    tenantId?: string
  ): Promise<OrderResponseDTO>;
  deleteOrder(id: string, tenantId?: string): Promise<void>;
}

export class StorageOrder implements IStorageOrder {
  private buildOrderSelectQuery() {
    return db
      .select({
        id: orders.id,
        tenantId: orders.tenantId,
        status: orders.status,
        address: orders.address,
        mobile: orders.mobile,
        email: orders.email,
        deliveryTime: orders.deliveryTime,
        timeZone: orders.timeZone,
        reusableBag: orders.reusableBag,
        createdBy: orders.createdBy,
        updatedBy: orders.updatedBy,
        createdOn: orders.createdOn,
        updatedOn: orders.updatedOn,
        userIp: orders.userIp,
      })
      .from(orders);
  }

  async getOrders(options?: GetOrdersOptions): Promise<GetOrdersResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const sortBy = options?.sortBy || ORDER_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;
    const whereCondition = buildOrderListCondition(options?.tenantId, options?.search);
    const offset = (page - 1) * pageSize;

    const sortColumn =
      sortBy === ORDER_SORT_FIELDS.STATUS
        ? orders.status
        : sortBy === ORDER_SORT_FIELDS.EMAIL
          ? orders.email
          : sortBy === ORDER_SORT_FIELDS.UPDATED_ON
            ? orders.updatedOn
            : orders.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    const countResult = whereCondition
      ? await db.select({ count: sql<number>`count(*)` }).from(orders).where(whereCondition)
      : await db.select({ count: sql<number>`count(*)` }).from(orders);

    const total = Number(countResult[0]?.count || 0);

    const items = whereCondition
      ? await this.buildOrderSelectQuery()
          .where(whereCondition)
          .orderBy(sortFn(sortColumn))
          .limit(pageSize)
          .offset(offset)
      : await this.buildOrderSelectQuery()
          .orderBy(sortFn(sortColumn))
          .limit(pageSize)
          .offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getOrder(id: string, tenantId?: string): Promise<OrderResponseDTO | undefined> {
    const [order] = await this.buildOrderSelectQuery()
      .where(buildOrderIdentityCondition(id, tenantId))
      .limit(1);

    return order;
  }

  async createOrder(data: CreateOrderDTO & OrderMutationMetadata): Promise<OrderResponseDTO> {
    const [order] = await db
      .insert(orders)
      .values({
        tenantId: data.tenantId,
        status: data.status,
        address: data.address,
        mobile: data.mobile,
        email: data.email || null,
        deliveryTime: data.deliveryTime,
        timeZone: data.timeZone,
        reusableBag: data.reusableBag,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        createdOn: new Date(),
        updatedOn: new Date(),
        userIp: data.userIp,
      })
      .returning();

    return order;
  }

  async updateOrder(
    id: string,
    updates: UpdateOrderDTO & OrderMutationMetadata,
    tenantId?: string
  ): Promise<OrderResponseDTO> {
    const updateData: Partial<typeof orders.$inferInsert> = {
      updatedOn: new Date(),
      updatedBy: updates.updatedBy,
      userIp: updates.userIp,
    };

    if (updates.tenantId !== undefined) updateData.tenantId = updates.tenantId;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.deliveryTime !== undefined) updateData.deliveryTime = updates.deliveryTime;
    if (updates.timeZone !== undefined) updateData.timeZone = updates.timeZone;
    if (updates.reusableBag !== undefined) updateData.reusableBag = updates.reusableBag;

    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(buildOrderIdentityCondition(id, tenantId))
      .returning();

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async deleteOrder(id: string, tenantId?: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.execute(sql`delete from order_items where order_id = ${id}::uuid`);
      await tx.delete(orders).where(buildOrderIdentityCondition(id, tenantId));
    });
  }
}

export const storageOrder = new StorageOrder();