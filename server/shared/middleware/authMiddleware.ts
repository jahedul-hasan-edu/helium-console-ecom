import type { NextFunction, Response } from "express";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "server/db";
import { sessions } from "server/db/schemas/sessions";
import { users } from "server/db/schemas/users";
import { HTTP_STATUS } from "server/shared/constants";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { JwtUtil } from "server/shared/utils/jwtUtil";
import type { AuthenticatedRequest } from "server/shared/utils/requestContext";

function getBearerToken(headerValue?: string): string | null {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice("Bearer ".length).trim() || null;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    ResponseHandler.error(res, "Authentication required", HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  try {
    const decoded = JwtUtil.verifyAccessToken(token);

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, decoded.sessionId),
          eq(sessions.userId, decoded.userId),
          eq(sessions.isActive, true),
          isNull(sessions.revokedOn)
        )
      )
      .limit(1);

    if (!session) {
      ResponseHandler.error(res, "Session is no longer active", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const [user] = await db
      .select({ id: users.id, isActive: users.isActive })
      .from(users)
      .where(and(eq(users.id, decoded.userId), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      ResponseHandler.error(res, "User is inactive", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (decoded.roleName !== "super_admin" && decoded.subscriptionExpiresAt) {
      const expiresAt = new Date(decoded.subscriptionExpiresAt);
      if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
        ResponseHandler.error(res, "Subscription expired", HTTP_STATUS.FORBIDDEN);
        return;
      }
    }

    req.user = decoded;
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;

    if (decoded.roleName !== "super_admin") {
      req.query.tenantId = decoded.tenantId;
      if (req.body && typeof req.body === "object") {
        req.body.tenantId = decoded.tenantId;
      }
    } else if (!req.query.tenantId && req.headers["x-tenant-id"]) {
      const requestedTenantId = Array.isArray(req.headers["x-tenant-id"])
        ? req.headers["x-tenant-id"][0]
        : req.headers["x-tenant-id"];

      if (requestedTenantId) {
        req.query.tenantId = requestedTenantId;
      }
    }

    next();
  } catch (error) {
    ResponseHandler.error(res, "Invalid or expired access token", HTTP_STATUS.UNAUTHORIZED);
  }
}