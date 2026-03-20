import type { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    id: string;
    tenantId: string;
    roleId: string;
    roleName: string;
    sessionId: string;
    subscriptionExpiresAt?: string;
  };
  tenantId?: string;
  userId?: string;
};

export function getUserIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] || req.socket.remoteAddress || "unknown";
  }

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  }

  return req.socket.remoteAddress || "unknown";
}

export function getRequestContext(req: AuthenticatedRequest) {
  if (!req.user) {
    return {
      roleName: undefined,
      tenantId: typeof req.query.tenantId === "string" ? req.query.tenantId : undefined,
      userId: undefined,
      userIp: getUserIp(req),
    };
  }

  return {
    roleName: req.user.roleName,
    tenantId: req.user.tenantId,
    userId: req.user.userId,
    userIp: getUserIp(req),
  };
}

export function extractTenantId(req: AuthenticatedRequest): string | undefined {
  if (!req.user) {
    return typeof req.query.tenantId === "string" ? req.query.tenantId : undefined;
  }

  if (req.user.roleName === "super_admin") {
    if (typeof req.query.tenantId === "string" && req.query.tenantId.trim()) {
      return req.query.tenantId;
    }

    if (req.body && typeof req.body.tenantId === "string" && req.body.tenantId.trim()) {
      return req.body.tenantId;
    }

    return undefined;
  }

  return req.user.tenantId;
}