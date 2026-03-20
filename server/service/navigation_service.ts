import type { Request } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { tenantPages } from "server/db/schemas/tenantPages";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { RoleName } from "server/shared/constants";
import { authService } from "./auth_service";
import { STATIC_PAGE_DEFINITIONS } from "server/shared/utils/authPages";
import type { AuthenticatedRequest } from "server/shared/utils/requestContext";

export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  routePath: string;
  parentId: string | null;
  sortOrder: number;
  permissions?: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canPreview: boolean;
  };
  children?: NavigationItem[];
}

function buildNavigationTree(items: NavigationItem[]): NavigationItem[] {
  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] as NavigationItem[] }]));
  const roots: NavigationItem[] = [];

  for (const item of Array.from(byId.values())) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }

  const sortItems = (list: NavigationItem[]) => {
    list.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
    for (const item of list) {
      if (item.children?.length) {
        sortItems(item.children);
      }
    }
  };

  sortItems(roots);
  return roots;
}

function fallbackNavigation(): NavigationItem[] {
  return STATIC_PAGE_DEFINITIONS.map((item) => ({
    id: item.slug,
    title: item.title,
    slug: item.slug,
    icon: item.icon,
    routePath: item.routePath,
    parentId: item.parentId,
    sortOrder: item.sortOrder,
    permissions: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canPreview: true,
    },
  }));
}

export const navigationService = {
  async getNavigation(req: AuthenticatedRequest): Promise<NavigationItem[]> {
    await authService.ensureSystemSeedData();

    if (!req.user) {
      return [];
    }

    if (req.user.roleName === RoleName.SUPER_ADMIN) {
      const pageRows = await db
        .select()
        .from(pages)
        .where(eq(pages.isActive, true))
        .orderBy(asc(pages.sortOrder));

      if (pageRows.length === 0) {
        return buildNavigationTree(fallbackNavigation());
      }

      return buildNavigationTree(
        pageRows.map((page) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          icon: page.icon,
          routePath: page.routePath,
          parentId: page.parentId,
          sortOrder: page.sortOrder,
          permissions: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canPreview: true,
          },
        }))
      );
    }

    if (req.user.roleName === RoleName.TENANT_ADMIN) {
      const rows = await db
        .select({
          id: pages.id,
          title: pages.title,
          slug: pages.slug,
          icon: pages.icon,
          routePath: pages.routePath,
          parentId: pages.parentId,
          sortOrder: pages.sortOrder,
        })
        .from(tenantPages)
        .innerJoin(pages, eq(pages.id, tenantPages.pageId))
        .where(
          and(
            eq(tenantPages.tenantId, req.user.tenantId),
            eq(tenantPages.isActive, true),
            eq(pages.isActive, true)
          )
        )
        .orderBy(asc(pages.sortOrder));

      return buildNavigationTree(
        rows.map((row) => ({
          ...row,
          permissions: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canPreview: true,
          },
        }))
      );
    }

    const rows = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        icon: pages.icon,
        routePath: pages.routePath,
        parentId: pages.parentId,
        sortOrder: pages.sortOrder,
        canView: tenantRolePagePermissions.canView,
        canCreate: tenantRolePagePermissions.canCreate,
        canUpdate: tenantRolePagePermissions.canUpdate,
        canDelete: tenantRolePagePermissions.canDelete,
        canPreview: tenantRolePagePermissions.canPreview,
      })
      .from(tenantRolePagePermissions)
      .innerJoin(pages, eq(pages.id, tenantRolePagePermissions.pageId))
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
          eq(tenantRolePagePermissions.isActive, true),
          eq(tenantRolePagePermissions.canView, true),
          eq(pages.isActive, true)
        )
      )
      .orderBy(asc(pages.sortOrder));

    return buildNavigationTree(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        icon: row.icon,
        routePath: row.routePath,
        parentId: row.parentId,
        sortOrder: row.sortOrder,
        permissions: {
          canView: row.canView,
          canCreate: row.canCreate,
          canUpdate: row.canUpdate,
          canDelete: row.canDelete,
          canPreview: row.canPreview,
        },
      }))
    );
  },
};