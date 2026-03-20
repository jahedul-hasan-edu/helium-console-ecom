import crypto from "crypto";
import * as otplib from "otplib";
import QRCode from "qrcode";
import type { Request } from "express";
import { and, count, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { refreshTokens } from "server/db/schemas/refreshTokens";
import { roles } from "server/db/schemas/roles";
import { sessions } from "server/db/schemas/sessions";
import { tenantSubscriptions } from "server/db/schemas/tenantSubscriptions";
import { userRoles } from "server/db/schemas/userRoles";
import { users } from "server/db/schemas/users";
import { EmailService } from "server/shared/utils/emailService";
import { STATIC_PAGE_DEFINITIONS } from "server/shared/utils/authPages";
import {
  JwtUtil,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "server/shared/utils/jwtUtil";
import { PasswordUtil } from "server/shared/utils/passwordUtil";
import { getUserIp, type AuthenticatedRequest } from "server/shared/utils/requestContext";

const { authenticator } = otplib as typeof import("otplib") & {
  authenticator: {
    generateSecret: () => string;
    keyuri: (user: string, service: string, secret: string) => string;
    verify: (input: { token: string; secret: string }) => boolean;
  };
};

interface ResolvedRole {
  roleId: string;
  roleName: string;
  displayName: string;
  bootstrap?: boolean;
}

interface PublicUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: string;
  twoFactorEnabled: boolean;
}

interface LoginSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

interface LoginRequiresTwoFactorResponse {
  requires2FA: true;
  tempToken: string;
  method: string;
}

type LoginResponse = LoginSuccessResponse | LoginRequiresTwoFactorResponse;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toPublicUser(
  user: typeof users.$inferSelect,
  role: ResolvedRole
): PublicUser {
  return {
    id: user.id,
    tenantId: user.tenantId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roleId: role.roleId,
    roleName: role.roleName,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

export class AuthService {
  async ensureSystemSeedData(): Promise<void> {
    const [{ value: roleCount }] = await db
      .select({ value: count() })
      .from(roles);

    if (Number(roleCount) === 0) {
      await db.insert(roles).values([
        { name: "super_admin", displayName: "Super Admin", description: "Full system control" },
        { name: "tenant_admin", displayName: "Tenant Admin", description: "Controls a single tenant" },
        { name: "user", displayName: "User", description: "Permission-driven tenant user" },
      ]);
    }

    const [{ value: pageCount }] = await db
      .select({ value: count() })
      .from(pages);

    if (Number(pageCount) === 0) {
      await db.insert(pages).values(
        STATIC_PAGE_DEFINITIONS.map((page) => ({
          title: page.title,
          slug: page.slug,
          icon: page.icon,
          routePath: page.routePath,
          sortOrder: page.sortOrder,
          parentId: page.parentId,
        }))
      );
    }
  }

  async resolveRole(userId: string, tenantId: string): Promise<ResolvedRole> {
    const assignedRoles = await db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        displayName: roles.displayName,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.tenantId, tenantId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );

    if (assignedRoles.length > 0) {
      const priority = { super_admin: 3, tenant_admin: 2, user: 1 } as const;
      assignedRoles.sort(
        (left, right) => (priority[right.roleName as keyof typeof priority] || 0) - (priority[left.roleName as keyof typeof priority] || 0)
      );
      return assignedRoles[0];
    }

    const [{ value: userRoleCount }] = await db
      .select({ value: count() })
      .from(userRoles);

    if (Number(userRoleCount) === 0) {
      return {
        roleId: "bootstrap-super-admin",
        roleName: "super_admin",
        displayName: "Bootstrap Super Admin",
        bootstrap: true,
      };
    }

    throw new Error("No active role assigned to this user");
  }

  async ensureUserRoleAssignment(userId: string, tenantId: string, requestedRoleName = "user", createdBy?: string, userIp?: string) {
    await this.ensureSystemSeedData();

    const roleName = requestedRoleName || "user";
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    const [existing] = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, tenantId)))
      .limit(1);

    if (existing) {
      await db
        .update(userRoles)
        .set({ roleId: role.id, isActive: true, updatedBy: createdBy, updatedOn: new Date(), userIp })
        .where(eq(userRoles.id, existing.id));
      return;
    }

    await db.insert(userRoles).values({
      userId,
      roleId: role.id,
      tenantId,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
      userIp,
    });
  }

  private async getActiveSubscriptionEndDate(tenantId: string): Promise<string | undefined> {
    const [subscription] = await db
      .select({ endDate: tenantSubscriptions.endDate })
      .from(tenantSubscriptions)
      .where(and(eq(tenantSubscriptions.tenantId, tenantId), eq(tenantSubscriptions.isActive, true)))
      .orderBy(desc(tenantSubscriptions.endDate))
      .limit(1);

    return subscription?.endDate || undefined;
  }

  private async createSessionAndTokens(
    user: typeof users.$inferSelect,
    role: ResolvedRole,
    req: Request
  ): Promise<LoginSuccessResponse> {
    const subscriptionEndDate =
      role.roleName === "super_admin" ? undefined : await this.getActiveSubscriptionEndDate(user.tenantId);

    if (role.roleName !== "super_admin") {
      if (!subscriptionEndDate || new Date(subscriptionEndDate).getTime() < Date.now()) {
        throw new Error("Subscription expired. Contact your administrator.");
      }
    }

    const now = new Date();
    const refreshExpiresOn = addDays(now, 7);
    const userIp = getUserIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        tenantId: user.tenantId,
        isActive: true,
        createdOn: now,
        lastActiveOn: now,
        expiresOn: refreshExpiresOn,
        userIp,
        userAgent,
      })
      .returning();

    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      id: user.id,
      tenantId: user.tenantId,
      roleId: role.roleId,
      roleName: role.roleName,
      sessionId: session.id,
      subscriptionExpiresAt: subscriptionEndDate ? new Date(subscriptionEndDate).toISOString() : undefined,
    };

    const refreshPayload: RefreshTokenPayload = {
      sessionId: session.id,
      userId: user.id,
      tenantId: user.tenantId,
    };

    const accessToken = JwtUtil.generateAccessToken(accessPayload);
    const refreshToken = JwtUtil.generateRefreshToken(refreshPayload);

    await db.insert(refreshTokens).values({
      sessionId: session.id,
      tokenHash: hashToken(refreshToken),
      expiresOn: refreshExpiresOn,
      userIp,
      userAgent,
    });

    await db
      .update(users)
      .set({ lastLoginAt: now, failedLoginAttempts: 0, lockedUntil: null, updatedOn: now, userIp })
      .where(eq(users.id, user.id));

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user, role),
    };
  }

  async login(req: Request): Promise<LoginResponse> {
    await this.ensureSystemSeedData();

    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      throw new Error("Account temporarily locked");
    }

    if (!PasswordUtil.verifyPassword(password, user.password)) {
      const nextAttemptCount = (user.failedLoginAttempts || 0) + 1;
      await db
        .update(users)
        .set({
          failedLoginAttempts: nextAttemptCount,
          lockedUntil: nextAttemptCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
          updatedOn: new Date(),
          userIp: getUserIp(req),
        })
        .where(eq(users.id, user.id));
      throw new Error("Invalid credentials");
    }

    const role = await this.resolveRole(user.id, user.tenantId);

    if (user.twoFactorEnabled) {
      if (user.twoFactorMethod === "email") {
        const code = generateOtpCode();
        await db
          .update(users)
          .set({
            emailOtpCode: code,
            emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            updatedOn: new Date(),
          })
          .where(eq(users.id, user.id));
        await EmailService.sendTwoFactorCode(user.email, code);
      }

      return {
        requires2FA: true,
        tempToken: JwtUtil.generateTwoFactorTempToken({ userId: user.id, tenantId: user.tenantId }),
        method: user.twoFactorMethod || "app",
      };
    }

    return this.createSessionAndTokens(user, role, req);
  }

  async verifyTwoFactor(req: Request): Promise<LoginSuccessResponse> {
    const { tempToken, code } = req.body as { tempToken?: string; code?: string };
    if (!tempToken || !code) {
      throw new Error("Temporary token and code are required");
    }

    const decoded = JwtUtil.verifyTwoFactorTempToken(tempToken);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user) {
      throw new Error("Invalid 2FA request");
    }

    const method = user.twoFactorMethod || "app";
    const isValid =
      method === "app"
        ? !!user.twoFactorSecret && authenticator.verify({ token: code, secret: user.twoFactorSecret })
        : user.emailOtpCode === code && !!user.emailOtpExpiresAt && new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error("Invalid 2FA code");
    }

    await db
      .update(users)
      .set({ emailOtpCode: null, emailOtpExpiresAt: null, updatedOn: new Date() })
      .where(eq(users.id, user.id));

    const role = await this.resolveRole(user.id, user.tenantId);
    return this.createSessionAndTokens(user, role, req);
  }

  async refresh(refreshTokenValue: string, req: Request): Promise<Pick<LoginSuccessResponse, "accessToken" | "refreshToken">> {
    if (!refreshTokenValue) {
      throw new Error("Refresh token is required");
    }

    JwtUtil.verifyRefreshToken(refreshTokenValue);
    const hashedToken = hashToken(refreshTokenValue);

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, hashedToken), isNull(refreshTokens.revokedOn), gt(refreshTokens.expiresOn, new Date())))
      .limit(1);

    if (!storedToken) {
      throw new Error("Invalid or expired refresh token");
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, storedToken.sessionId), eq(sessions.isActive, true), isNull(sessions.revokedOn)))
      .limit(1);

    if (!session) {
      throw new Error("Invalid or expired refresh token");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, session.userId), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      throw new Error("User is inactive");
    }

    const role = await this.resolveRole(user.id, user.tenantId);
    const subscriptionEndDate =
      role.roleName === "super_admin" ? undefined : await this.getActiveSubscriptionEndDate(user.tenantId);
    if (role.roleName !== "super_admin" && (!subscriptionEndDate || new Date(subscriptionEndDate).getTime() < Date.now())) {
      await db.update(sessions).set({ isActive: false, revokedOn: new Date() }).where(eq(sessions.id, session.id));
      await db.update(refreshTokens).set({ revokedOn: new Date() }).where(eq(refreshTokens.sessionId, session.id));
      throw new Error("Subscription expired");
    }

    const refreshPayload: RefreshTokenPayload = {
      sessionId: session.id,
      userId: user.id,
      tenantId: user.tenantId,
    };

    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      id: user.id,
      tenantId: user.tenantId,
      roleId: role.roleId,
      roleName: role.roleName,
      sessionId: session.id,
      subscriptionExpiresAt: subscriptionEndDate ? new Date(subscriptionEndDate).toISOString() : undefined,
    };

    const nextRefreshToken = JwtUtil.generateRefreshToken(refreshPayload);
    const [nextStoredToken] = await db
      .insert(refreshTokens)
      .values({
        sessionId: session.id,
        tokenHash: hashToken(nextRefreshToken),
        expiresOn: addDays(new Date(), 7),
        userIp: getUserIp(req),
        userAgent: req.headers["user-agent"] || "unknown",
      })
      .returning();

    await db
      .update(refreshTokens)
      .set({ revokedOn: new Date(), replacedByTokenId: nextStoredToken.id })
      .where(eq(refreshTokens.id, storedToken.id));

    await db
      .update(sessions)
      .set({ lastActiveOn: new Date() })
      .where(eq(sessions.id, session.id));

    return {
      accessToken: JwtUtil.generateAccessToken(accessPayload),
      refreshToken: nextRefreshToken,
    };
  }

  async logout(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) {
      return;
    }

    await db
      .update(refreshTokens)
      .set({ revokedOn: new Date() })
      .where(and(eq(refreshTokens.sessionId, req.user.sessionId), isNull(refreshTokens.revokedOn)));

    await db
      .update(sessions)
      .set({ revokedOn: new Date(), isActive: false })
      .where(eq(sessions.id, req.user.sessionId));
  }

  async logoutAll(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) {
      return;
    }

    const activeSessions = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.userId, req.user.userId), eq(sessions.tenantId, req.user.tenantId), eq(sessions.isActive, true)));

    const sessionIds = activeSessions.map((session) => session.id);
    if (sessionIds.length === 0) {
      return;
    }

    await db
      .update(refreshTokens)
      .set({ revokedOn: new Date() })
      .where(and(inArray(refreshTokens.sessionId, sessionIds), isNull(refreshTokens.revokedOn)));

    await db
      .update(sessions)
      .set({ revokedOn: new Date(), isActive: false })
      .where(inArray(sessions.id, sessionIds));
  }

  async getCurrentUser(req: AuthenticatedRequest): Promise<PublicUser> {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    const role = await this.resolveRole(user.id, user.tenantId);
    return toPublicUser(user, role);
  }

  async setupTwoFactor(req: AuthenticatedRequest): Promise<{ method: string; message?: string; qrCode?: string; secret?: string }> {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const { method } = req.body as { method?: "email" | "app" };
    if (!method || !["email", "app"].includes(method)) {
      throw new Error("2FA method must be email or app");
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    if (method === "app") {
      const secret = authenticator.generateSecret();
      const otpauthUrl = authenticator.keyuri(user.email, "HeliumConsole", secret);
      const qrCode = await QRCode.toDataURL(otpauthUrl);

      await db
        .update(users)
        .set({ twoFactorSecret: secret, twoFactorMethod: "app", updatedOn: new Date() })
        .where(eq(users.id, user.id));

      return { method, qrCode, secret };
    }

    const code = generateOtpCode();
    await db
      .update(users)
      .set({
        twoFactorMethod: "email",
        emailOtpCode: code,
        emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        updatedOn: new Date(),
      })
      .where(eq(users.id, user.id));
    await EmailService.sendTwoFactorCode(user.email, code);

    return { method, message: "OTP sent to email" };
  }

  async verifyTwoFactorSetup(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const { code } = req.body as { code?: string };
    if (!code) {
      throw new Error("2FA code is required");
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid =
      user.twoFactorMethod === "app"
        ? !!user.twoFactorSecret && authenticator.verify({ token: code, secret: user.twoFactorSecret })
        : user.emailOtpCode === code && !!user.emailOtpExpiresAt && new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error("Invalid 2FA code");
    }

    await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        emailOtpCode: null,
        emailOtpExpiresAt: null,
        updatedOn: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  async disableTwoFactor(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const { code } = req.body as { code?: string };
    if (!code) {
      throw new Error("2FA code is required");
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid =
      user.twoFactorMethod === "app"
        ? !!user.twoFactorSecret && authenticator.verify({ token: code, secret: user.twoFactorSecret })
        : user.emailOtpCode === code && !!user.emailOtpExpiresAt && new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error("Invalid 2FA code");
    }

    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorMethod: null,
        emailOtpCode: null,
        emailOtpExpiresAt: null,
        updatedOn: new Date(),
      })
      .where(eq(users.id, user.id));
  }
}

export const authService = new AuthService();