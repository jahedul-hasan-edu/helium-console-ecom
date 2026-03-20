import { storageUser } from "./repos/user_repo";
import { CreateUserDTO, GetUsersOptions, GetUsersResponse, UpdateUserDTO, UserResponseDTO } from "server/shared/dtos/User";
import { PasswordUtil } from "server/shared/utils/passwordUtil";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { USER_SORT_FIELDS } from "server/shared/constants/feature/userMessages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";
import { authService } from "./auth_service";
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

    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    return await storageUser.getUsers(tenantId, options);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string, req: Request): Promise<UserResponseDTO | undefined> {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    return await storageUser.getUser(id, tenantId);
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string, req: Request): Promise<UserResponseDTO | undefined> {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    return await storageUser.getUserByUsername(username, tenantId);
  }

  /**
   * Check if an email already exists
   */
  async checkEmailExists(email: string, req: Request): Promise<UserResponseDTO | undefined> {
    const tenantId = extractTenantId(req as AuthenticatedRequest) || (req as AuthenticatedRequest).user?.tenantId;
    return await storageUser.getUserByEmail(email, tenantId);
  }

  /**
   * Create a new user
   */
  async createUser(req: Request): Promise<UserResponseDTO> {
    const user: CreateUserDTO = req.body;
    const authenticatedRequest = req as AuthenticatedRequest;
    const userIp = getUserIp(req);
    const requesterRole = authenticatedRequest.user?.roleName;
    const tenantId = extractTenantId(authenticatedRequest) || authenticatedRequest.user?.tenantId || user.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required to create a user");
    }

    const requestedRoleName = requesterRole === "tenant_admin" ? "user" : user.roleName || "user";

    const hashedPassword = PasswordUtil.hashPassword(user.password);

    const createdUser = await storageUser.createUser({
      ...user,
      tenantId,
      password: hashedPassword,
      userIp,
      createdBy: authenticatedRequest.user?.userId,
    });

    await authService.ensureUserRoleAssignment(
      createdUser.id,
      tenantId,
      requestedRoleName,
      authenticatedRequest.user?.userId,
      userIp
    );

    return { ...createdUser, roleName: requestedRoleName };
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: UpdateUserDTO, req: Request): Promise<UserResponseDTO> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userIp = getUserIp(req);
    const tenantId = extractTenantId(authenticatedRequest) || authenticatedRequest.user?.tenantId;
    if (!tenantId) {
      throw new Error("Tenant context is required to update a user");
    }

    const updatedUser = await storageUser.updateUser(id, {
      ...updates,
      tenantId,
      userIp,
      updatedBy: authenticatedRequest.user?.userId,
    });

    if (updates.roleName) {
      await authService.ensureUserRoleAssignment(
        id,
        tenantId,
        authenticatedRequest.user?.roleName === "tenant_admin" ? "user" : updates.roleName,
        authenticatedRequest.user?.userId,
        userIp
      );
      return { ...updatedUser, roleName: updates.roleName };
    }

    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string, req: Request): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const tenantId = extractTenantId(authenticatedRequest) || authenticatedRequest.user?.tenantId;
    return await storageUser.deleteUser(id, tenantId);
  }
}

export const userService = new UserService();
