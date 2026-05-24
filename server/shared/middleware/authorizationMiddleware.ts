import type { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { roles } from "server/db/schemas/roles";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { tenants } from "server/db/schemas/tenants";
import { userRoles } from "server/db/schemas/userRoles";
import { users } from "server/db/schemas/users";
import { AUTH_MESSAGES, HTTP_STATUS, RoleName } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import {
  ADMIN_ROUTE_PAGE_MAP,
} from "server/shared/utils/authPages";
import type { AuthenticatedRequest } from "server/shared/utils/requestContext";

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

function getRequiredScopes(method: string, pageSlug: string): string[] {
  if (method === "GET") {
    return [`read:${pageSlug}`, `write:${pageSlug}`, `manage:${pageSlug}`];
  }

  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    return [`write:${pageSlug}`, `manage:${pageSlug}`];
  }

  return [`read:${pageSlug}`, `write:${pageSlug}`, `manage:${pageSlug}`];
}

function resolvePageSlugFromPath(pathname: string): string | null {
  const cleanedPath = pathname.replace(/^\/+/, "");
  const [firstSegment] = cleanedPath.split("/");

  if (!firstSegment) {
    return "dashboard";
  }

  return ADMIN_ROUTE_PAGE_MAP[firstSegment] || null;
}

export async function authorizationMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    ResponseHandler.error(res, AUTH_MESSAGES.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  if (req.user.roleName === RoleName.SUPER_ADMIN) {
    next();
    return;
  }

  const [activeUserTenantRole] = await db
    .select({ userId: users.id, tenantId: tenants.id, roleId: roles.id, userRoleId: userRoles.id })
    .from(users)
    .innerJoin(tenants, and(eq(tenants.id, users.tenantId), eq(tenants.isActive, true)))
    .innerJoin(roles, and(eq(roles.id, req.user.roleId), eq(roles.isActive, true)))
    .innerJoin(
      userRoles,
      and(
        eq(userRoles.userId, req.user.userId),
        eq(userRoles.tenantId, req.user.tenantId),
        eq(userRoles.roleId, req.user.roleId),
        eq(userRoles.isActive, true)
      )
    )
    .where(and(eq(users.id, req.user.userId), eq(users.tenantId, req.user.tenantId), eq(users.isActive, true)))
    .limit(1);

  if (!activeUserTenantRole) {
    ResponseHandler.error(res, AUTH_MESSAGES.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    return;
  }

  const pageSlug = resolvePageSlugFromPath(req.path);
  if (!pageSlug || pageSlug === "dashboard") {
    next();
    return;
  }

  const [page] = await db
    .select({ id: pages.id, slug: pages.slug })
    .from(pages)
    .where(and(eq(pages.slug, pageSlug), eq(pages.isActive, true)))
    .limit(1);

  if (!page) {
    next();
    return;
  }

  const [permissionRecord] = await db
    .select({
      scopes: tenantRolePagePermissions.scopes,
    })
    .from(tenantRolePagePermissions)
    .innerJoin(
      tenantRolePages,
      and(
        eq(tenantRolePages.tenantId, tenantRolePagePermissions.tenantId),
        eq(tenantRolePages.roleId, tenantRolePagePermissions.roleId),
        eq(tenantRolePages.pageId, tenantRolePagePermissions.pageId),
        eq(tenantRolePages.isActive, true)
      )
    )
    .where(
      and(
        eq(tenantRolePagePermissions.tenantId, req.user.tenantId),
        eq(tenantRolePagePermissions.roleId, req.user.roleId),
        eq(tenantRolePagePermissions.pageId, page.id),
        eq(tenantRolePagePermissions.isActive, true)
      )
    )
    .limit(1);

  if (!permissionRecord) {
    ResponseHandler.error(res, AUTH_MESSAGES.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    return;
  }

  const definedScopes = parseScopes(permissionRecord.scopes);
  if (definedScopes.length === 0) {
    next();
    return;
  }

  const requiredScopes = getRequiredScopes(req.method, page.slug);
  const hasRequiredScope = requiredScopes.some((scope) => definedScopes.includes(scope));
  if (!hasRequiredScope) {
    ResponseHandler.error(res, AUTH_MESSAGES.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
    return;
  }

  next();
}