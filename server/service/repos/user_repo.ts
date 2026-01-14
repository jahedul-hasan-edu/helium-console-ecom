import { eq, desc, sql, asc } from "drizzle-orm";
import { db } from "server/db";
import { users } from "server/db/schemas/users";
import { CreateUserDTO, GetUsersOptions, GetUsersResponse, UpdateUserDTO, UserResponseDTO } from "server/shared/dtos/User";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { USER_SORT_FIELDS } from "server/shared/constants/feature/userMessages";
import { PasswordUtil } from "server/shared/utils/passwordUtil";

export interface IStorageUser {
  // Users
  getUsers(options?: GetUsersOptions): Promise<GetUsersResponse>;
  getUser(id: string): Promise<UserResponseDTO | undefined>;
  getUserByUsername(username: string): Promise<UserResponseDTO | undefined>;
  createUser(user: CreateUserDTO & { tenantId: string; password: string; userIp: string }): Promise<UserResponseDTO>;
  updateUser(id: string, updates: UpdateUserDTO & { tenantId: string; userIp: string }): Promise<UserResponseDTO>;
  deleteUser(id: string): Promise<void>;
}

export class StorageUser implements IStorageUser {
  // Users
  async getUsers(options?: GetUsersOptions): Promise<GetUsersResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || USER_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with search filter
    const baseQuery = search
      ? db.select().from(users).where(
          sql`${users.firstName} ILIKE ${"%"+search+"%"} OR ${users.lastName} ILIKE ${"%"+search+"%"} OR ${users.email} ILIKE ${"%"+search+"%"}`
        )
      : db.select().from(users);

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = sortBy === USER_SORT_FIELDS.EMAIL ? users.email : sortBy === USER_SORT_FIELDS.NAME ? users.firstName : users.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getUser(id: string): Promise<UserResponseDTO | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<UserResponseDTO | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: CreateUserDTO & { tenantId: string; password: string; userIp: string }): Promise<UserResponseDTO> {
    // Hash password
    const hashedPassword = PasswordUtil.hashPassword(insertUser.password);
    
    const [user] = await db.insert(users).values({
      tenantId: insertUser.tenantId!,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      mobile: insertUser.mobile,
      password: hashedPassword,
      userIp: insertUser.userIp,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUserDTO & { tenantId: string; userIp: string }): Promise<UserResponseDTO> {
    const updatePayload: any = {
      userIp: updates.userIp,
      tenantId: updates.tenantId,
    };
    
    if (updates.firstName) updatePayload.firstName = updates.firstName;
    if (updates.lastName) updatePayload.lastName = updates.lastName;
    if (updates.mobile) updatePayload.mobile = updates.mobile;

    const [user] = await db.update(users).set(updatePayload).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const storageUser = new StorageUser();
