import type { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { tenantPages } from "server/db/schemas/tenantPages";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import {
  ADMIN_ROUTE_PAGE_MAP,
  HTTP_METHOD_PERMISSION_MAP,
  type PermissionKey,
} from "server/shared/utils/authPages";
import type { AuthenticatedRequest } from "server/shared/utils/requestContext";

function getPermissionKey(method: string): PermissionKey {
  return HTTP_METHOD_PERMISSION_MAP[method] || "canView";
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
    ResponseHandler.error(res, "Authentication required", HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  if (req.user.roleName === "super_admin") {
    next();
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

  if (req.user.roleName === "tenant_admin") {
    const [tenantPage] = await db
      .select({ id: tenantPages.id })
      .from(tenantPages)
      .where(
        and(
          eq(tenantPages.tenantId, req.user.tenantId),
          eq(tenantPages.pageId, page.id),
          eq(tenantPages.isActive, true)
        )
      )
      .limit(1);

    if (!tenantPage) {
      ResponseHandler.error(res, "Access denied", HTTP_STATUS.FORBIDDEN);
      return;
    }

    next();
    return;
  }

  const permissionKey = getPermissionKey(req.method);
  const [permissionRecord] = await db
    .select({
      canView: tenantRolePagePermissions.canView,
      canCreate: tenantRolePagePermissions.canCreate,
      canUpdate: tenantRolePagePermissions.canUpdate,
      canDelete: tenantRolePagePermissions.canDelete,
      canPreview: tenantRolePagePermissions.canPreview,
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

  if (!permissionRecord || !permissionRecord[permissionKey]) {
    ResponseHandler.error(res, "Access denied", HTTP_STATUS.FORBIDDEN);
    return;
  }

  next();
}