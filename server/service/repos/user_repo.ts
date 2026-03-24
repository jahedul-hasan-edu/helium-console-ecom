import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "server/db";
import { roles } from "server/db/schemas/roles";
import { tenants } from "server/db/schemas/tenants";
import { userRoles } from "server/db/schemas/userRoles";
import { users } from "server/db/schemas/users";
import { CreateUserDTO, GetUsersOptions, GetUsersResponse, UpdateUserDTO, UserResponseDTO } from "server/shared/dtos/User";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { USER_SORT_FIELDS } from "server/shared/constants/feature/userMessages";

export interface IStorageUser {
  // Users
  getUsers(tenantId: string | undefined, options?: GetUsersOptions): Promise<GetUsersResponse>;
  getUser(id: string, tenantId?: string): Promise<UserResponseDTO | undefined>;
  getUserByUsername(username: string, tenantId?: string): Promise<UserResponseDTO | undefined>;
  getUserByEmail(email: string, tenantId?: string): Promise<UserResponseDTO | undefined>;
  createUser(user: CreateUserDTO & { tenantId: string; password: string; userIp: string; createdBy?: string }): Promise<UserResponseDTO>;
  updateUser(id: string, updates: UpdateUserDTO & { tenantId: string; userIp: string; updatedBy?: string }): Promise<UserResponseDTO>;
  deleteUser(id: string, tenantId?: string): Promise<void>;
}

function mapUser(row: {
  users: typeof users.$inferSelect;
  roles: typeof roles.$inferSelect | null;
  tenants: typeof tenants.$inferSelect | null;
}): UserResponseDTO {
  const user = row.users;
  return {
    id: user.id,
    tenantId: user.tenantId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    tenantName: row.tenants?.name ?? null,
    isActive: user.isActive,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorMethod: user.twoFactorMethod,
    roleId: row.roles?.id ?? null,
    roleName: row.roles?.name ?? null,
    roleDisplayName: row.roles?.displayName ?? null,
    createdBy: user.createdBy,
    updatedBy: user.updatedBy,
    createdOn: user.createdOn,
    updatedOn: user.updatedOn,
    userIp: user.userIp,
  };
}

export class StorageUser implements IStorageUser {
  private buildUserQuery(tenantId?: string, search?: string) {
    const filters = [];
    if (tenantId) {
      filters.push(eq(users.tenantId, tenantId));
    }
    if (search) {
      filters.push(
        sql`${users.firstName} ILIKE ${`%${search}%`} OR ${users.lastName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`
      );
    }

    const whereCondition = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters);

    let query = db
      .select({ users, roles, tenants })
      .from(users)
      .leftJoin(
        userRoles,
        and(eq(userRoles.userId, users.id), eq(userRoles.tenantId, users.tenantId), eq(userRoles.isActive, true))
      )
      .leftJoin(roles, and(eq(roles.id, userRoles.roleId), eq(roles.isActive, true)))
      .leftJoin(tenants, eq(tenants.id, users.tenantId));

    if (whereCondition) {
      query = query.where(whereCondition) as typeof query;
    }

    return query;
  }

  // Users
  async getUsers(tenantId: string | undefined, options?: GetUsersOptions): Promise<GetUsersResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || USER_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    const baseQuery = this.buildUserQuery(tenantId, search);

    const countResult = await baseQuery;
    const total = countResult.length;

    const sortColumn = sortBy === USER_SORT_FIELDS.EMAIL ? users.email : sortBy === USER_SORT_FIELDS.NAME ? users.firstName : users.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    const offset = (page - 1) * pageSize;
    const rows = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return {
      items: rows.map(mapUser),
      total,
      page,
      pageSize,
    };
  }

  async getUser(id: string, tenantId?: string): Promise<UserResponseDTO | undefined> {
    const query = this.buildUserQuery(tenantId);
    const [user] = await query.where(eq(users.id, id));
    return user ? mapUser(user) : undefined;
  }

  async getUserByUsername(username: string, tenantId?: string): Promise<UserResponseDTO | undefined> {
    const query = this.buildUserQuery(tenantId);
    const [user] = await query.where(eq(users.email, username));
    return user ? mapUser(user) : undefined;
  }

  async getUserByEmail(email: string, tenantId?: string): Promise<UserResponseDTO | undefined> {
    const query = this.buildUserQuery(tenantId);
    const [user] = await query.where(eq(users.email, email));
    return user ? mapUser(user) : undefined;
  }

  async createUser(insertUser: CreateUserDTO & { tenantId: string; password: string; userIp: string; createdBy?: string }): Promise<UserResponseDTO> {
    const [user] = await db.insert(users).values({
      tenantId: insertUser.tenantId!,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      mobile: insertUser.mobile,
      password: insertUser.password,
      isActive: insertUser.isActive ?? true,
      twoFactorEnabled: insertUser.twoFactorEnabled ?? false,
      twoFactorMethod: insertUser.twoFactorMethod ?? null,
      twoFactorSecret: null,
      emailOtpCode: null,
      emailOtpExpiresAt: null,
      createdBy: insertUser.createdBy,
      updatedBy: insertUser.createdBy,
      createdOn: new Date(),
      updatedOn: new Date(),
      userIp: insertUser.userIp,
    }).returning();
    return (await this.getUser(user.id, insertUser.tenantId)) as UserResponseDTO;
  }

  async updateUser(id: string, updates: UpdateUserDTO & { tenantId: string; userIp: string; updatedBy?: string }): Promise<UserResponseDTO> {
    const updatePayload: any = {
      userIp: updates.userIp,
      tenantId: updates.tenantId,
      updatedBy: updates.updatedBy,
      updatedOn: new Date(),
    };
    
    if (updates.firstName) updatePayload.firstName = updates.firstName;
    if (updates.lastName) updatePayload.lastName = updates.lastName;
    if (updates.mobile) updatePayload.mobile = updates.mobile;
    if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive;
    if (updates.twoFactorEnabled !== undefined) updatePayload.twoFactorEnabled = updates.twoFactorEnabled;
    if (updates.twoFactorMethod !== undefined) updatePayload.twoFactorMethod = updates.twoFactorMethod;
    if (updates.twoFactorEnabled === false || updates.twoFactorMethod === null) {
      updatePayload.twoFactorSecret = null;
      updatePayload.emailOtpCode = null;
      updatePayload.emailOtpExpiresAt = null;
    }

    await db
      .update(users)
      .set(updatePayload)
      .where(and(eq(users.id, id), eq(users.tenantId, updates.tenantId)))
      .returning();
    return (await this.getUser(id, updates.tenantId)) as UserResponseDTO;
  }

  async deleteUser(id: string, tenantId?: string): Promise<void> {
    const whereCondition = tenantId
      ? and(eq(users.id, id), eq(users.tenantId, tenantId))
      : eq(users.id, id);
    await db.delete(users).where(whereCondition);
  }
}

export const storageUser = new StorageUser();
