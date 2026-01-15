import { storageUser } from "./repos/user_repo";
import { CreateUserDTO, GetUsersOptions, GetUsersResponse, UpdateUserDTO, UserResponseDTO } from "server/shared/dtos/User";
import { PasswordUtil } from "server/shared/utils/passwordUtil";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { USER_SORT_FIELDS } from "server/shared/constants/feature/userMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";
/**
 * User Service
 * Handles all user-related business logic
 * Acts as a bridge between controller and repository
 */
export class UserService {
  /**
   * Get users with pagination, sorting, and searching
   */
  async getUsers(req: Request): Promise<GetUsersResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || USER_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    const options: GetUsersOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageUser.getUsers(options);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<UserResponseDTO | undefined> {
    return await storageUser.getUser(id);
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<UserResponseDTO | undefined> {
    return await storageUser.getUserByUsername(username);
  }

  /**
   * Check if an email already exists
   */
  async checkEmailExists(email: string): Promise<UserResponseDTO | undefined> {
    return await storageUser.getUserByEmail(email);
  }

  /**
   * Create a new user
   */
  async createUser(req: Request): Promise<UserResponseDTO> {
    const user: CreateUserDTO = req.body;
    
    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    // Hash password
    const hashedPassword = PasswordUtil.hashPassword(user.password);

    return await storageUser.createUser({
      ...user,
      tenantId: DEFAULT_TENANT_ID,
      password: hashedPassword,
      userIp,
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: UpdateUserDTO, req: Request): Promise<UserResponseDTO> {
    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    return await storageUser.updateUser(id, {
      ...updates,
      tenantId: DEFAULT_TENANT_ID,
      userIp,
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    return await storageUser.deleteUser(id);
  }
}

export const userService = new UserService();
