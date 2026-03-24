import { and, eq, or } from "drizzle-orm";
import { db } from "server/db";
import { roles } from "server/db/schemas/roles";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { userRoles } from "server/db/schemas/userRoles";
import { storageUser } from "./repos/user_repo";
import { CreateUserDTO, GetUsersOptions, GetUsersResponse, UpdateUserDTO, UserResponseDTO } from "server/shared/dtos/User";
import { RoleName, TwoFactorMethod } from "server/shared/constants/enums";
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
  private async resolveAllowedRoleId(
    tenantId: string,
    requesterRole: string | undefined,
    requestedRoleId?: string,
    requestedRoleName?: RoleName,
  ): Promise<string> {
    const allowedSystemRoles = requesterRole === RoleName.SUPER_ADMIN
      ? [RoleName.TENANT_ADMIN, RoleName.USER]
      : [RoleName.TENANT_ADMIN, RoleName.USER];

    if (requestedRoleId) {
      const [role] = await db
        .select({ id: roles.id, name: roles.name })
        .from(roles)
        .where(and(eq(roles.id, requestedRoleId), eq(roles.isActive, true)))
        .limit(1);

      if (!role || role.name === RoleName.SUPER_ADMIN) {
        throw new Error("Selected role is not available");
      }

      if (allowedSystemRoles.includes(role.name as RoleName)) {
        return role.id;
      }

      const [tenantLinkedRole] = await db
        .select({ id: roles.id })
        .from(roles)
        .leftJoin(
          tenantRolePages,
          and(eq(tenantRolePages.roleId, roles.id), eq(tenantRolePages.tenantId, tenantId))
        )
        .leftJoin(
          tenantRolePagePermissions,
          and(eq(tenantRolePagePermissions.roleId, roles.id), eq(tenantRolePagePermissions.tenantId, tenantId))
        )
        .leftJoin(
          userRoles,
          and(eq(userRoles.roleId, roles.id), eq(userRoles.tenantId, tenantId), eq(userRoles.isActive, true))
        )
        .where(
          and(
            eq(roles.id, requestedRoleId),
            eq(roles.isActive, true),
            or(
              eq(tenantRolePages.tenantId, tenantId),
              eq(tenantRolePagePermissions.tenantId, tenantId),
              eq(userRoles.tenantId, tenantId)
            )
          )
        )
        .limit(1);

      if (!tenantLinkedRole) {
        throw new Error("Selected role is not available for this tenant");
      }

      return requestedRoleId;
    }

    const fallbackRoleName = requesterRole === RoleName.TENANT_ADMIN ? RoleName.USER : requestedRoleName || RoleName.USER;
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.name, fallbackRoleName), eq(roles.isActive, true)))
      .limit(1);

    if (!role) {
      throw new Error("Selected role is not available");
    }

    return role.id;
  }

  private normalizeTwoFactorSettings(input: { twoFactorEnabled?: boolean; twoFactorMethod?: TwoFactorMethod | null }) {
    if (input.twoFactorMethod === null) {
      return { twoFactorEnabled: false, twoFactorMethod: null };
    }

    if (input.twoFactorMethod === TwoFactorMethod.EMAIL) {
      return { twoFactorEnabled: true, twoFactorMethod: TwoFactorMethod.EMAIL };
    }

    if (input.twoFactorMethod === TwoFactorMethod.APP) {
      return { twoFactorEnabled: false, twoFactorMethod: TwoFactorMethod.APP };
    }

    return {
      twoFactorEnabled: input.twoFactorEnabled ?? false,
      twoFactorMethod: input.twoFactorEnabled ? TwoFactorMethod.EMAIL : null,
    };
  }

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

    const requestedRoleId = await this.resolveAllowedRoleId(tenantId, requesterRole, user.roleId, user.roleName);
    const twoFactorSettings = this.normalizeTwoFactorSettings({
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod,
    });

    const hashedPassword = PasswordUtil.hashPassword(user.password);

    const createdUser = await storageUser.createUser({
      ...user,
      tenantId,
      password: hashedPassword,
      ...twoFactorSettings,
      userIp,
      createdBy: authenticatedRequest.user?.userId,
    });

    await authService.ensureUserRoleAssignmentByRoleId(
      createdUser.id,
      tenantId,
      requestedRoleId,
      authenticatedRequest.user?.userId,
      userIp
    );

    return (await storageUser.getUser(createdUser.id, tenantId)) as UserResponseDTO;
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

    const twoFactorSettings = this.normalizeTwoFactorSettings({
      twoFactorEnabled: updates.twoFactorEnabled,
      twoFactorMethod: updates.twoFactorMethod,
    });

    const updatedUser = await storageUser.updateUser(id, {
      ...updates,
      ...(updates.twoFactorEnabled !== undefined || updates.twoFactorMethod !== undefined ? twoFactorSettings : {}),
      tenantId,
      userIp,
      updatedBy: authenticatedRequest.user?.userId,
    });

    if (updates.roleId || updates.roleName) {
      const requestedRoleId = await this.resolveAllowedRoleId(tenantId, authenticatedRequest.user?.roleName, updates.roleId, updates.roleName);
      await authService.ensureUserRoleAssignmentByRoleId(
        id,
        tenantId,
        requestedRoleId,
        authenticatedRequest.user?.userId,
        userIp
      );
      return (await storageUser.getUser(id, tenantId)) as UserResponseDTO;
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
