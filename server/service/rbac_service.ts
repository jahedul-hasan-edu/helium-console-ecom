import type { Request } from "express";
import { and, asc, desc, eq, inArray, notInArray, or, sql } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { roles } from "server/db/schemas/roles";
import { tenantPages } from "server/db/schemas/tenantPages";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { userRoles } from "server/db/schemas/userRoles";
import { RoleName } from "server/shared/constants";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import type { CreatePageDTO, GetPagesResponseDTO, PageResponseDTO } from "server/shared/dtos/Page";
import type { PagePermissionResponseDTO } from "server/shared/dtos/PagePermission";
import type { RoleResponseDTO } from "server/shared/dtos/Role";
import { createPageSchema, getPagesQuerySchema, updatePageSchema } from "server/shared/dtos/Page";
import { updatePagePermissionsSchema } from "server/shared/dtos/PagePermission";
import { createRoleSchema, updateRoleSchema } from "server/shared/dtos/Role";
import { authService } from "server/service/auth_service";
import { STATIC_PAGE_DEFINITIONS, SUPER_ADMIN_ONLY_PAGE_SLUGS } from "server/shared/utils/authPages";
import { extractTenantId, getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";

const SYSTEM_ROLE_NAMES = new Set<string>([RoleName.SUPER_ADMIN, RoleName.TENANT_ADMIN, RoleName.USER]);
const TENANT_VISIBLE_SYSTEM_ROLE_NAMES = new Set<string>([RoleName.TENANT_ADMIN, RoleName.USER]);
const SYSTEM_PAGE_SLUGS = new Set(STATIC_PAGE_DEFINITIONS.map((page) => page.slug));

function getPredefinedScopesForSlug(slug: string): string[] {
  return [`read:${slug}`, `write:${slug}`, `manage:${slug}`];
}

function parseScopes(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((scope) => scope.trim())
        .filter(Boolean)
    )
  );
}

function toScopesString(scopes: string[]): string | null {
  if (scopes.length === 0) {
    return null;
  }

  return scopes.join(",");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function assertAuthenticatedUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error("Authentication is required");
  }

  return req.user;
}

function toPageResponse(page: typeof pages.$inferSelect): PageResponseDTO {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    icon: page.icon,
    parentId: page.parentId,
    sortOrder: page.sortOrder,
    routePath: page.routePath,
    isActive: page.isActive,
    isSystem: SYSTEM_PAGE_SLUGS.has(page.slug),
    createdOn: page.createdOn ?? null,
    updatedOn: page.updatedOn ?? null,
  };
}

export class RbacService {
  private getTenantContext(req: Request) {
    const authenticatedRequest = req as AuthenticatedRequest;
    const user = assertAuthenticatedUser(authenticatedRequest);
    const tenantId = extractTenantId(authenticatedRequest) || user.tenantId;

    return {
      tenantId,
      user,
      userIp: getUserIp(req),
    };
  }

  private async getRoleIdsForTenant(tenantId: string): Promise<string[]> {
    const [linkedRoleRows, permissionRoleRows, userRoleRows] = await Promise.all([
      db.select({ roleId: tenantRolePages.roleId }).from(tenantRolePages).where(eq(tenantRolePages.tenantId, tenantId)),
      db.select({ roleId: tenantRolePagePermissions.roleId }).from(tenantRolePagePermissions).where(eq(tenantRolePagePermissions.tenantId, tenantId)),
      db.select({ roleId: userRoles.roleId }).from(userRoles).where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.isActive, true))),
    ]);

    return Array.from(
      new Set([
        ...linkedRoleRows.map((row) => row.roleId),
        ...permissionRoleRows.map((row) => row.roleId),
        ...userRoleRows.map((row) => row.roleId),
      ])
    );
  }

  private async getRoleSummary(roleId: string, tenantId: string): Promise<RoleResponseDTO> {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role || role.name === RoleName.SUPER_ADMIN) {
      throw new Error("Role not found");
    }

    const [assignedUserCountRow, activePageCountRow] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(userRoles)
        .where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.roleId, roleId), eq(userRoles.isActive, true))),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tenantRolePages)
        .where(and(eq(tenantRolePages.tenantId, tenantId), eq(tenantRolePages.roleId, roleId), eq(tenantRolePages.isActive, true))),
    ]);

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      isSystem: SYSTEM_ROLE_NAMES.has(role.name),
      assignedUserCount: Number(assignedUserCountRow[0]?.count || 0),
      activePageCount: Number(activePageCountRow[0]?.count || 0),
      createdOn: role.createdOn ?? null,
      updatedOn: role.updatedOn ?? null,
    };
  }

  private async getAccessibleRole(roleId: string, tenantId: string): Promise<typeof roles.$inferSelect> {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role || role.name === RoleName.SUPER_ADMIN) {
      throw new Error("Role not found");
    }

    if (TENANT_VISIBLE_SYSTEM_ROLE_NAMES.has(role.name)) {
      return role;
    }

    const tenantRoleIds = await this.getRoleIdsForTenant(tenantId);
    if (!tenantRoleIds.includes(roleId)) {
      throw new Error("Role not found for the current tenant");
    }

    return role;
  }

  private async ensurePageUniqueness(slug: string, excludeId?: string): Promise<void> {
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, slug));

    if (existing.some((page) => page.id !== excludeId)) {
      throw new Error("A page with this slug already exists");
    }
  }

  async getPages(req: Request): Promise<GetPagesResponseDTO> {
    const authenticatedRequest = req as AuthenticatedRequest;
    if (authenticatedRequest.user?.roleName !== RoleName.SUPER_ADMIN) {
      throw new Error("Only super admins can manage pages");
    }

    await authService.ensureSystemSeedData();
    const { tenantId: _ignoredTenantId, ...queryInput } = req.query as Record<string, unknown> & { tenantId?: unknown };
    const query = getPagesQuerySchema.parse(queryInput);
    const page = query.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = query.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = query.search?.trim();
    const sortBy = query.sortBy || "sortOrder";
    const sortOrder = query.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    const whereCondition = search
      ? or(
          sql`${pages.title} ILIKE ${`%${search}%`}`,
          sql`${pages.slug} ILIKE ${`%${search}%`}`,
          sql`${pages.routePath} ILIKE ${`%${search}%`}`
        )
      : undefined;

    const sortColumn =
      sortBy === "title"
        ? pages.title
        : sortBy === "slug"
          ? pages.slug
          : sortBy === "routePath"
            ? pages.routePath
            : sortBy === "createdOn"
              ? pages.createdOn
              : sortBy === "updatedOn"
                ? pages.updatedOn
                : pages.sortOrder;
    const primarySort = (sortOrder === "asc" ? asc : desc)(sortColumn);
    const offset = (page - 1) * pageSize;

    const countResult = whereCondition
      ? await db.select({ count: sql<number>`count(*)` }).from(pages).where(whereCondition)
      : await db.select({ count: sql<number>`count(*)` }).from(pages);

    const pageRows = whereCondition
      ? await db
          .select()
          .from(pages)
          .where(whereCondition)
          .orderBy(primarySort, asc(pages.title))
          .limit(pageSize)
          .offset(offset)
      : await db
          .select()
          .from(pages)
          .orderBy(primarySort, asc(pages.title))
          .limit(pageSize)
          .offset(offset);

    const total = Number(countResult[0]?.count || 0);

    return {
      items: pageRows.map(toPageResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createPage(req: Request): Promise<PageResponseDTO> {
    const authenticatedRequest = req as AuthenticatedRequest;
    if (authenticatedRequest.user?.roleName !== RoleName.SUPER_ADMIN) {
      throw new Error("Only super admins can manage pages");
    }

    const { tenantId: _ignoredTenantId, ...bodyInput } = req.body as Record<string, unknown> & { tenantId?: unknown };
    const payload = createPageSchema.parse(bodyInput);
    await this.ensurePageUniqueness(payload.slug);

    const [page] = await db
      .insert(pages)
      .values({
        ...payload,
        isActive: payload.isActive ?? true,
        createdBy: authenticatedRequest.user.userId,
        updatedBy: authenticatedRequest.user.userId,
        createdOn: new Date(),
        updatedOn: new Date(),
        userIp: getUserIp(req),
      })
      .returning();

    return toPageResponse(page);
  }

  async updatePage(id: string, req: Request): Promise<PageResponseDTO> {
    const authenticatedRequest = req as AuthenticatedRequest;
    if (authenticatedRequest.user?.roleName !== RoleName.SUPER_ADMIN) {
      throw new Error("Only super admins can manage pages");
    }

    const { tenantId: _ignoredTenantId, ...bodyInput } = req.body as Record<string, unknown> & { tenantId?: unknown };
    const payload = updatePageSchema.parse(bodyInput);
    const [existingPage] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!existingPage) {
      throw new Error("Page not found");
    }

    const isSystem = SYSTEM_PAGE_SLUGS.has(existingPage.slug);
    if (payload.slug && payload.slug !== existingPage.slug) {
      await this.ensurePageUniqueness(payload.slug, id);
    }

    const updatePayload: Partial<CreatePageDTO> & { updatedOn: Date; updatedBy?: string; userIp: string } = {
      updatedOn: new Date(),
      updatedBy: authenticatedRequest.user.userId,
      userIp: getUserIp(req),
    };

    if (payload.title !== undefined) updatePayload.title = payload.title;
    if (payload.icon !== undefined) updatePayload.icon = payload.icon;
    if (payload.parentId !== undefined) updatePayload.parentId = payload.parentId;
    if (payload.sortOrder !== undefined) updatePayload.sortOrder = payload.sortOrder;

    if (!isSystem) {
      if (payload.slug !== undefined) updatePayload.slug = payload.slug;
      if (payload.routePath !== undefined) updatePayload.routePath = payload.routePath;
      if (payload.isActive !== undefined) updatePayload.isActive = payload.isActive;
    }

    const [page] = await db.update(pages).set(updatePayload).where(eq(pages.id, id)).returning();

    return {
      ...toPageResponse(page),
      isSystem,
    };
  }

  async deletePage(id: string, req: Request): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    if (authenticatedRequest.user?.roleName !== RoleName.SUPER_ADMIN) {
      throw new Error("Only super admins can manage pages");
    }

    const [existingPage] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!existingPage) {
      throw new Error("Page not found");
    }

    if (SYSTEM_PAGE_SLUGS.has(existingPage.slug)) {
      throw new Error("System pages cannot be deleted");
    }

    await db.delete(pages).where(eq(pages.id, id));
  }

  async getRoles(req: Request): Promise<RoleResponseDTO[]> {
    const { tenantId } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to manage roles");
    }

    await authService.ensureSystemSeedData();

    const tenantRoleIds = await this.getRoleIdsForTenant(tenantId);
    const systemRoles = await db
      .select()
      .from(roles)
      .where(inArray(roles.name, Array.from(TENANT_VISIBLE_SYSTEM_ROLE_NAMES)));
    const customRoles = tenantRoleIds.length > 0
      ? await db
          .select()
          .from(roles)
          .where(and(inArray(roles.id, tenantRoleIds), notInArray(roles.name, [RoleName.SUPER_ADMIN, RoleName.TENANT_ADMIN, RoleName.USER])))
      : [];

    const uniqueRoles = Array.from(new Map([...systemRoles, ...customRoles].map((role) => [role.id, role])).values());

    const summaries = await Promise.all(uniqueRoles.map((role) => this.getRoleSummary(role.id, tenantId)));
    return summaries.sort((left, right) => {
      if (left.isSystem !== right.isSystem) {
        return left.isSystem ? -1 : 1;
      }
      return left.displayName.localeCompare(right.displayName);
    });
  }

  async createRole(req: Request): Promise<RoleResponseDTO> {
    const { tenantId, user, userIp } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to create roles");
    }

    const payload = createRoleSchema.parse(req.body);
    const baseSlug = slugify(payload.displayName) || "role";
    let internalName = `${tenantId.slice(0, 8)}_${baseSlug}`;
    let counter = 1;

    while ((await db.select({ id: roles.id }).from(roles).where(eq(roles.name, internalName)).limit(1)).length > 0) {
      internalName = `${tenantId.slice(0, 8)}_${baseSlug}_${counter}`;
      counter += 1;
    }

    const [role] = await db
      .insert(roles)
      .values({
        name: internalName,
        displayName: payload.displayName,
        description: payload.description ?? null,
        isActive: payload.isActive ?? true,
        createdBy: user.userId,
        updatedBy: user.userId,
        createdOn: new Date(),
        updatedOn: new Date(),
        userIp,
      })
      .returning();

    const assignablePages = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.isActive, true), notInArray(pages.slug, [...SUPER_ADMIN_ONLY_PAGE_SLUGS])));

    if (assignablePages.length > 0) {
      await db.insert(tenantRolePages).values(
        assignablePages.map((page) => ({
          tenantId,
          roleId: role.id,
          pageId: page.id,
          isActive: false,
          createdBy: user.userId,
          updatedBy: user.userId,
          createdOn: new Date(),
          updatedOn: new Date(),
          userIp,
        }))
      );

      await db.insert(tenantRolePagePermissions).values(
        assignablePages.map((page) => ({
          tenantId,
          roleId: role.id,
          pageId: page.id,
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canPreview: false,
          isActive: true,
          createdBy: user.userId,
          updatedBy: user.userId,
          createdOn: new Date(),
          updatedOn: new Date(),
          userIp,
        }))
      );
    }

    return this.getRoleSummary(role.id, tenantId);
  }

  async updateRole(id: string, req: Request): Promise<RoleResponseDTO> {
    const { tenantId, user, userIp } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to update roles");
    }

    const payload = updateRoleSchema.parse(req.body);
    const role = await this.getAccessibleRole(id, tenantId);
    if (SYSTEM_ROLE_NAMES.has(role.name)) {
      throw new Error("System roles cannot be edited");
    }

    if (payload.isActive === false) {
      const [usage] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userRoles)
        .where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.roleId, id), eq(userRoles.isActive, true)));
      if (Number(usage?.count || 0) > 0) {
        throw new Error("Reassign users before deactivating this role");
      }
    }

    await db
      .update(roles)
      .set({
        ...(payload.displayName !== undefined ? { displayName: payload.displayName } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        updatedBy: user.userId,
        updatedOn: new Date(),
        userIp,
      })
      .where(eq(roles.id, id));

    return this.getRoleSummary(id, tenantId);
  }

  async deleteRole(id: string, req: Request): Promise<void> {
    const { tenantId } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to delete roles");
    }

    const role = await this.getAccessibleRole(id, tenantId);
    if (SYSTEM_ROLE_NAMES.has(role.name)) {
      throw new Error("System roles cannot be deleted");
    }

    const [usage] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userRoles)
      .where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.roleId, id), eq(userRoles.isActive, true)));

    if (Number(usage?.count || 0) > 0) {
      throw new Error("Reassign users before deleting this role");
    }

    await db.delete(roles).where(eq(roles.id, id));
  }

  async getPagePermissions(roleId: string, req: Request): Promise<PagePermissionResponseDTO> {
    const { tenantId } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to manage page permissions");
    }

    await authService.ensureSystemSeedData();
    const role = await this.getAccessibleRole(roleId, tenantId);
    const assignablePages = await db
      .select()
      .from(pages)
      .where(notInArray(pages.slug, [...SUPER_ADMIN_ONLY_PAGE_SLUGS]))
      .orderBy(asc(pages.sortOrder), asc(pages.title));

    const [tenantPageRows, rolePageRows, permissionRows] = await Promise.all([
      db.select().from(tenantPages).where(eq(tenantPages.tenantId, tenantId)),
      db
        .select()
        .from(tenantRolePages)
        .where(and(eq(tenantRolePages.tenantId, tenantId), eq(tenantRolePages.roleId, roleId))),
      db
        .select()
        .from(tenantRolePagePermissions)
        .where(and(eq(tenantRolePagePermissions.tenantId, tenantId), eq(tenantRolePagePermissions.roleId, roleId))),
    ]);

    const tenantPageMap = new Map(tenantPageRows.map((row) => [row.pageId, row]));
    const rolePageMap = new Map(rolePageRows.map((row) => [row.pageId, row]));
    const permissionMap = new Map(permissionRows.map((row) => [row.pageId, row]));
    const isTenantAdminRole = role.name === RoleName.TENANT_ADMIN;

    return {
      role: {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        isSystem: SYSTEM_ROLE_NAMES.has(role.name),
      },
      pages: assignablePages.map((page) => {
        const tenantPage = tenantPageMap.get(page.id);
        const rolePage = rolePageMap.get(page.id);
        const permission = permissionMap.get(page.id);
        const enabled = isTenantAdminRole ? !!tenantPage?.isActive : !!rolePage?.isActive;

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          icon: page.icon,
          routePath: page.routePath,
          sortOrder: page.sortOrder,
          isSystem: SYSTEM_PAGE_SLUGS.has(page.slug),
          isActive: page.isActive,
          enabled,
          canView: isTenantAdminRole ? enabled : permission?.canView ?? false,
          canCreate: isTenantAdminRole ? enabled : permission?.canCreate ?? false,
          canUpdate: isTenantAdminRole ? enabled : permission?.canUpdate ?? false,
          canDelete: isTenantAdminRole ? enabled : permission?.canDelete ?? false,
          canPreview: isTenantAdminRole ? enabled : permission?.canPreview ?? false,
          scopes: parseScopes(permission?.scopes),
        };
      }),
    };
  }

  async updatePagePermissions(roleId: string, req: Request): Promise<PagePermissionResponseDTO> {
    const { tenantId, user, userIp } = this.getTenantContext(req);
    if (!tenantId) {
      throw new Error("Select a tenant to manage page permissions");
    }

    const payload = updatePagePermissionsSchema.parse(req.body);
    const role = await this.getAccessibleRole(roleId, tenantId);
    const assignablePages = await db
      .select({ id: pages.id, slug: pages.slug, isActive: pages.isActive })
      .from(pages)
      .where(notInArray(pages.slug, [...SUPER_ADMIN_ONLY_PAGE_SLUGS]));
    const pageMap = new Map(assignablePages.map((page) => [page.id, page]));
    const isTenantAdminRole = role.name === RoleName.TENANT_ADMIN;

    for (const entry of payload.entries) {
      const page = pageMap.get(entry.pageId);
      if (!page) {
        continue;
      }

      const enabled = page.isActive ? entry.enabled : false;
      const canView = enabled && (isTenantAdminRole || entry.canView || entry.canCreate || entry.canUpdate || entry.canDelete || entry.canPreview);
      const allowedScopes = new Set(getPredefinedScopesForSlug(page.slug));
      const sanitizedScopes = enabled
        ? Array.from(new Set((entry.scopes || []).map((scope) => scope.trim()).filter((scope) => allowedScopes.has(scope))))
        : [];
      const permissionState = isTenantAdminRole
        ? {
            canView: enabled,
            canCreate: enabled,
            canUpdate: enabled,
            canDelete: enabled,
            canPreview: enabled,
            scopes: toScopesString(sanitizedScopes),
          }
        : {
            canView,
            canCreate: enabled && entry.canCreate,
            canUpdate: enabled && entry.canUpdate,
            canDelete: enabled && entry.canDelete,
            canPreview: enabled && entry.canPreview,
            scopes: toScopesString(sanitizedScopes),
          };

      await db
        .insert(tenantRolePages)
        .values({
          tenantId,
          roleId,
          pageId: entry.pageId,
          isActive: enabled,
          createdBy: user.userId,
          updatedBy: user.userId,
          createdOn: new Date(),
          updatedOn: new Date(),
          userIp,
        })
        .onConflictDoUpdate({
          target: [tenantRolePages.tenantId, tenantRolePages.roleId, tenantRolePages.pageId],
          set: {
            isActive: enabled,
            updatedBy: user.userId,
            updatedOn: new Date(),
            userIp,
          },
        });

      await db
        .insert(tenantRolePagePermissions)
        .values({
          tenantId,
          roleId,
          pageId: entry.pageId,
          ...permissionState,
          isActive: true,
          createdBy: user.userId,
          updatedBy: user.userId,
          createdOn: new Date(),
          updatedOn: new Date(),
          userIp,
        })
        .onConflictDoUpdate({
          target: [tenantRolePagePermissions.tenantId, tenantRolePagePermissions.roleId, tenantRolePagePermissions.pageId],
          set: {
            ...permissionState,
            isActive: true,
            updatedBy: user.userId,
            updatedOn: new Date(),
            userIp,
          },
        });

      if (isTenantAdminRole) {
        await db
          .insert(tenantPages)
          .values({
            tenantId,
            pageId: entry.pageId,
            isActive: enabled,
            createdBy: user.userId,
            updatedBy: user.userId,
            createdOn: new Date(),
            updatedOn: new Date(),
            userIp,
          })
          .onConflictDoUpdate({
            target: [tenantPages.tenantId, tenantPages.pageId],
            set: {
              isActive: enabled,
              updatedBy: user.userId,
              updatedOn: new Date(),
              userIp,
            },
          });
      }
    }

    return this.getPagePermissions(roleId, req);
  }
}

export const rbacService = new RbacService();