import crypto from "crypto";
import * as otplib from "otplib";
import QRCode from "qrcode";
import type { Request } from "express";
import { and, asc, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "server/db";
import { pages } from "server/db/schemas/pages";
import { refreshTokens } from "server/db/schemas/refreshTokens";
import { roles } from "server/db/schemas/roles";
import { sessions } from "server/db/schemas/sessions";
import { subscriptionPlans } from "server/db/schemas/subscriptionPlans";
import { tenantPages } from "server/db/schemas/tenantPages";
import { tenantRolePagePermissions } from "server/db/schemas/tenantRolePagePermissions";
import { tenantRolePages } from "server/db/schemas/tenantRolePages";
import { tenants } from "server/db/schemas/tenants";
import { tenantSubscriptions } from "server/db/schemas/tenantSubscriptions";
import { userRoles } from "server/db/schemas/userRoles";
import { users } from "server/db/schemas/users";
import {
  type PublicSubscriptionPlanDTO,
  type RegisterSuperAdminDTO,
  type RegisterTenantAdminDTO,
  type SystemStatusResponseDTO,
  loginSchema,
  refreshTokenSchema,
  registerSuperAdminSchema,
  registerTenantAdminSchema,
  twoFactorSetupSchema,
  verify2FASchema,
} from "server/shared/dtos/Auth";
import { AUTH_MESSAGES, RegistrationMode, RoleName, TwoFactorMethod } from "server/shared/constants";
import { EmailService } from "server/shared/utils/emailService";
import { STATIC_PAGE_DEFINITIONS, SUPER_ADMIN_ONLY_PAGE_SLUGS } from "server/shared/utils/authPages";
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
  roleName: RoleName;
  displayName: string;
}

interface PublicUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: RoleName;
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
  method: TwoFactorMethod;
}

type LoginResponse = LoginSuccessResponse | LoginRequiresTwoFactorResponse;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildTenantName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}'s Store`;
}

function buildTenantDomain(email: string): string {
  const localPart = email.split("@")[0] || "tenant";
  const slug = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "tenant";

  return `${slug}-${crypto.randomBytes(3).toString("hex")}`;
}

function toPublicUser(user: typeof users.$inferSelect, role: ResolvedRole): PublicUser {
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
    const existingRoles = await db.select({ name: roles.name }).from(roles);
    const existingRoleNames = new Set(existingRoles.map((role) => role.name));
    const missingRoles = [
      { name: RoleName.SUPER_ADMIN, displayName: "Super Admin", description: "Full system control" },
      { name: RoleName.TENANT_ADMIN, displayName: "Tenant Admin", description: "Controls a single tenant" },
      { name: RoleName.USER, displayName: "User", description: "Permission-driven tenant user" },
    ].filter((role) => !existingRoleNames.has(role.name));

    if (missingRoles.length > 0) {
      await db.insert(roles).values(missingRoles);
    }

    const existingPages = await db.select({ slug: pages.slug }).from(pages);
    const existingPageSlugs = new Set(existingPages.map((page) => page.slug));
    const missingPages = STATIC_PAGE_DEFINITIONS.filter((page) => !existingPageSlugs.has(page.slug));

    if (missingPages.length > 0) {
      await db.insert(pages).values(
        missingPages.map((page) => ({
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

  async getSystemStatus(): Promise<SystemStatusResponseDTO> {
    await this.ensureSystemSeedData();

    const [superAdminRole] = await db
      .select({ id: userRoles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(roles.name, RoleName.SUPER_ADMIN),
          eq(roles.isActive, true),
          eq(userRoles.isActive, true)
        )
      )
      .limit(1);

    return {
      hasSuperAdmin: !!superAdminRole,
      registrationMode: superAdminRole
        ? RegistrationMode.TENANT_ADMIN_REGISTER
        : RegistrationMode.SUPER_ADMIN_BOOTSTRAP,
    };
  }

  async getPublicSubscriptionPlans(): Promise<PublicSubscriptionPlanDTO[]> {
    const planRows = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        price: subscriptionPlans.price,
        durationDays: subscriptionPlans.durationDays,
      })
      .from(subscriptionPlans)
      .orderBy(asc(subscriptionPlans.price), asc(subscriptionPlans.name));

    return planRows.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
    }));
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

    if (assignedRoles.length === 0) {
      throw new Error(AUTH_MESSAGES.LOGIN_NO_ROLE);
    }

    const priority = {
      [RoleName.SUPER_ADMIN]: 3,
      [RoleName.TENANT_ADMIN]: 2,
      [RoleName.USER]: 1,
    } as const;

    assignedRoles.sort(
      (left, right) =>
        (priority[right.roleName as RoleName] || 0) - (priority[left.roleName as RoleName] || 0)
    );

    return assignedRoles[0] as ResolvedRole;
  }

  async ensureUserRoleAssignment(
    userId: string,
    tenantId: string,
    requestedRoleName: RoleName = RoleName.USER,
    createdBy?: string,
    userIp?: string
  ): Promise<void> {
    await this.ensureSystemSeedData();

    const [role] = await db.select().from(roles).where(eq(roles.name, requestedRoleName)).limit(1);
    if (!role) {
      throw new Error(`Role not found: ${requestedRoleName}`);
    }

    const [existing] = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.tenantId, tenantId)))
      .limit(1);

    if (existing) {
      await db
        .update(userRoles)
        .set({
          roleId: role.id,
          isActive: true,
          updatedBy: createdBy,
          updatedOn: new Date(),
          userIp,
        })
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
      createdOn: new Date(),
      updatedOn: new Date(),
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
      role.roleName === RoleName.SUPER_ADMIN
        ? undefined
        : await this.getActiveSubscriptionEndDate(user.tenantId);

    if (
      role.roleName !== RoleName.SUPER_ADMIN &&
      (!subscriptionEndDate || new Date(subscriptionEndDate).getTime() < Date.now())
    ) {
      throw new Error(AUTH_MESSAGES.LOGIN_SUBSCRIPTION_EXPIRED);
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
      .set({
        lastLoginAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedOn: now,
        userIp,
      })
      .where(eq(users.id, user.id));

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user, role),
    };
  }

  async register(req: Request): Promise<LoginSuccessResponse> {
    await this.ensureSystemSeedData();

    const systemStatus = await this.getSystemStatus();
    const rawEmail = req.body && typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!rawEmail) {
      throw new Error(AUTH_MESSAGES.REGISTER_EMAIL_REQUIRED);
    }

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, rawEmail)).limit(1);
    if (existingUser) {
      throw new Error(AUTH_MESSAGES.REGISTER_EMAIL_EXISTS);
    }

    if (systemStatus.registrationMode === RegistrationMode.SUPER_ADMIN_BOOTSTRAP) {
      const payload = registerSuperAdminSchema.parse({ ...req.body, email: rawEmail });
      return this.registerSuperAdmin(payload, req);
    }

    const payload = registerTenantAdminSchema.parse({ ...req.body, email: rawEmail });
    return this.registerTenantAdmin(payload, req);
  }

  private async registerSuperAdmin(
    payload: RegisterSuperAdminDTO,
    req: Request
  ): Promise<LoginSuccessResponse> {
    const systemStatus = await this.getSystemStatus();
    if (systemStatus.hasSuperAdmin) {
      throw new Error(AUTH_MESSAGES.REGISTER_SUPER_ADMIN_EXISTS);
    }

    const userIp = getUserIp(req);
    const now = new Date();
    const hashedPassword = PasswordUtil.hashPassword(payload.password);

    const registration = await db.transaction(async (tx) => {
      const [role] = await tx.select().from(roles).where(eq(roles.name, RoleName.SUPER_ADMIN)).limit(1);
      if (!role) {
        throw new Error(`Role not found: ${RoleName.SUPER_ADMIN}`);
      }

      const [systemTenant] = await tx.select().from(tenants).where(eq(tenants.domain, "system")).limit(1);
      const tenant =
        systemTenant ||
        (
          await tx
            .insert(tenants)
            .values({
              name: "System",
              domain: "system",
              isActive: true,
              createdOn: now,
              updatedOn: now,
              userIp,
            })
            .returning()
        )[0];

      const [user] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          mobile: payload.mobile,
          password: hashedPassword,
          isActive: true,
          createdOn: now,
          updatedOn: now,
          userIp,
        })
        .returning();

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: role.id,
        tenantId: tenant.id,
        isActive: true,
        createdOn: now,
        updatedOn: now,
        userIp,
      });

      return {
        user,
        role: {
          roleId: role.id,
          roleName: RoleName.SUPER_ADMIN,
          displayName: role.displayName,
        } satisfies ResolvedRole,
      };
    });

    return this.createSessionAndTokens(registration.user, registration.role, req);
  }

  private async registerTenantAdmin(
    payload: RegisterTenantAdminDTO,
    req: Request
  ): Promise<LoginSuccessResponse> {
    const systemStatus = await this.getSystemStatus();
    if (!systemStatus.hasSuperAdmin) {
      throw new Error(AUTH_MESSAGES.REGISTER_BOOTSTRAP_REQUIRED);
    }

    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, payload.planId)).limit(1);
    if (!plan) {
      throw new Error(AUTH_MESSAGES.REGISTER_PLAN_NOT_FOUND);
    }

    if (!plan.durationDays) {
      throw new Error(AUTH_MESSAGES.REGISTER_PLAN_UNAVAILABLE);
    }

    const userIp = getUserIp(req);
    const now = new Date();
    const durationDays = plan.durationDays;
    const hashedPassword = PasswordUtil.hashPassword(payload.password);

    const registration = await db.transaction(async (tx) => {
      const [role] = await tx.select().from(roles).where(eq(roles.name, RoleName.TENANT_ADMIN)).limit(1);
      if (!role) {
        throw new Error(`Role not found: ${RoleName.TENANT_ADMIN}`);
      }

      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: buildTenantName(payload.firstName, payload.lastName),
          domain: buildTenantDomain(payload.email),
          isActive: true,
          createdOn: now,
          updatedOn: now,
          userIp,
        })
        .returning();

      await tx.insert(tenantSubscriptions).values({
        tenantId: tenant.id,
        planId: plan.id,
        startDate: toDateOnlyString(now),
        endDate: toDateOnlyString(addDays(now, durationDays)),
        isActive: true,
        createdOn: now,
        updatedOn: now,
        userIp,
      });

      const [user] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          mobile: payload.mobile,
          password: hashedPassword,
          isActive: true,
          createdOn: now,
          updatedOn: now,
          userIp,
        })
        .returning();

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: role.id,
        tenantId: tenant.id,
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
        createdOn: now,
        updatedOn: now,
        userIp,
      });

      const availablePages = await tx
        .select({ id: pages.id, slug: pages.slug })
        .from(pages)
        .where(eq(pages.isActive, true));

      const assignablePages = availablePages.filter(
        (page) => !SUPER_ADMIN_ONLY_PAGE_SLUGS.includes(page.slug as (typeof SUPER_ADMIN_ONLY_PAGE_SLUGS)[number])
      );

      if (assignablePages.length > 0) {
        await tx.insert(tenantPages).values(
          assignablePages.map((page) => ({
            tenantId: tenant.id,
            pageId: page.id,
            isActive: true,
            createdBy: user.id,
            updatedBy: user.id,
            createdOn: now,
            updatedOn: now,
            userIp,
          }))
        );

        await tx.insert(tenantRolePages).values(
          assignablePages.map((page) => ({
            tenantId: tenant.id,
            roleId: role.id,
            pageId: page.id,
            isActive: true,
            createdBy: user.id,
            updatedBy: user.id,
            createdOn: now,
            updatedOn: now,
            userIp,
          }))
        );

        await tx.insert(tenantRolePagePermissions).values(
          assignablePages.map((page) => ({
            tenantId: tenant.id,
            roleId: role.id,
            pageId: page.id,
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canPreview: true,
            isActive: true,
            createdBy: user.id,
            updatedBy: user.id,
            createdOn: now,
            updatedOn: now,
            userIp,
          }))
        );
      }

      return {
        user,
        role: {
          roleId: role.id,
          roleName: RoleName.TENANT_ADMIN,
          displayName: role.displayName,
        } satisfies ResolvedRole,
      };
    });

    return this.createSessionAndTokens(registration.user, registration.role, req);
  }

  async login(req: Request): Promise<LoginResponse> {
    await this.ensureSystemSeedData();

    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new Error(AUTH_MESSAGES.LOGIN_ACCOUNT_DEACTIVATED);
    }

    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      throw new Error(AUTH_MESSAGES.LOGIN_ACCOUNT_LOCKED);
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

      throw new Error(AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS);
    }

    const role = await this.resolveRole(user.id, user.tenantId);

    if (user.twoFactorEnabled) {
      if (user.twoFactorMethod === TwoFactorMethod.EMAIL) {
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
        method: (user.twoFactorMethod as TwoFactorMethod | null) || TwoFactorMethod.APP,
      };
    }

    return this.createSessionAndTokens(user, role, req);
  }

  async verifyTwoFactor(req: Request): Promise<LoginSuccessResponse> {
    const parsed = verify2FASchema.parse(req.body);
    if (!parsed.tempToken) {
      throw new Error(AUTH_MESSAGES.TWO_FACTOR_INVALID_CODE);
    }

    const decoded = JwtUtil.verifyTwoFactorTempToken(parsed.tempToken);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.TWO_FACTOR_INVALID_CODE);
    }

    const method = (user.twoFactorMethod as TwoFactorMethod | null) || TwoFactorMethod.APP;
    const isValid =
      method === TwoFactorMethod.APP
        ? !!user.twoFactorSecret && authenticator.verify({ token: parsed.code, secret: user.twoFactorSecret })
        : user.emailOtpCode === parsed.code &&
          !!user.emailOtpExpiresAt &&
          new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error(AUTH_MESSAGES.TWO_FACTOR_INVALID_CODE);
    }

    await db
      .update(users)
      .set({ emailOtpCode: null, emailOtpExpiresAt: null, updatedOn: new Date() })
      .where(eq(users.id, user.id));

    const role = await this.resolveRole(user.id, user.tenantId);
    return this.createSessionAndTokens(user, role, req);
  }

  async refresh(refreshTokenValue: string, req: Request): Promise<Pick<LoginSuccessResponse, "accessToken" | "refreshToken">> {
    const { refreshToken } = refreshTokenSchema.parse({ refreshToken: refreshTokenValue });
    JwtUtil.verifyRefreshToken(refreshToken);

    const hashedToken = hashToken(refreshToken);
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, hashedToken),
          isNull(refreshTokens.revokedOn),
          gt(refreshTokens.expiresOn, new Date())
        )
      )
      .limit(1);

    if (!storedToken) {
      throw new Error(AUTH_MESSAGES.REFRESH_INVALID);
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, storedToken.sessionId), eq(sessions.isActive, true), isNull(sessions.revokedOn)))
      .limit(1);

    if (!session) {
      throw new Error(AUTH_MESSAGES.REFRESH_INVALID);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, session.userId), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_INACTIVE);
    }

    const role = await this.resolveRole(user.id, user.tenantId);
    const subscriptionEndDate =
      role.roleName === RoleName.SUPER_ADMIN
        ? undefined
        : await this.getActiveSubscriptionEndDate(user.tenantId);

    if (
      role.roleName !== RoleName.SUPER_ADMIN &&
      (!subscriptionEndDate || new Date(subscriptionEndDate).getTime() < Date.now())
    ) {
      await db.update(sessions).set({ isActive: false, revokedOn: new Date() }).where(eq(sessions.id, session.id));
      await db.update(refreshTokens).set({ revokedOn: new Date() }).where(eq(refreshTokens.sessionId, session.id));
      throw new Error(AUTH_MESSAGES.LOGIN_SUBSCRIPTION_EXPIRED);
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

    await db.update(sessions).set({ lastActiveOn: new Date() }).where(eq(sessions.id, session.id));

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
      .where(
        and(
          eq(sessions.userId, req.user.userId),
          eq(sessions.tenantId, req.user.tenantId),
          eq(sessions.isActive, true)
        )
      );

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
      throw new Error(AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_INACTIVE);
    }

    const role = await this.resolveRole(user.id, user.tenantId);
    return toPublicUser(user, role);
  }

  async setupTwoFactor(
    req: AuthenticatedRequest
  ): Promise<{ method: TwoFactorMethod; message?: string; qrCode?: string; secret?: string }> {
    if (!req.user) {
      throw new Error(AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    const { method } = twoFactorSetupSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_INACTIVE);
    }

    if (method === TwoFactorMethod.APP) {
      const secret = authenticator.generateSecret();
      const otpauthUrl = authenticator.keyuri(user.email, "HeliumConsole", secret);
      const qrCode = await QRCode.toDataURL(otpauthUrl);

      await db
        .update(users)
        .set({ twoFactorSecret: secret, twoFactorMethod: TwoFactorMethod.APP, updatedOn: new Date() })
        .where(eq(users.id, user.id));

      return { method, qrCode, secret };
    }

    const code = generateOtpCode();
    await db
      .update(users)
      .set({
        twoFactorMethod: TwoFactorMethod.EMAIL,
        emailOtpCode: code,
        emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        updatedOn: new Date(),
      })
      .where(eq(users.id, user.id));
    await EmailService.sendTwoFactorCode(user.email, code);

    return { method, message: AUTH_MESSAGES.TWO_FACTOR_OTP_SENT };
  }

  async verifyTwoFactorSetup(req: AuthenticatedRequest): Promise<void> {
    if (!req.user) {
      throw new Error(AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    const { code } = verify2FASchema.pick({ code: true }).parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_INACTIVE);
    }

    const isValid =
      user.twoFactorMethod === TwoFactorMethod.APP
        ? !!user.twoFactorSecret && authenticator.verify({ token: code, secret: user.twoFactorSecret })
        : user.emailOtpCode === code &&
          !!user.emailOtpExpiresAt &&
          new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error(AUTH_MESSAGES.TWO_FACTOR_INVALID_CODE);
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
      throw new Error(AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    const { code } = verify2FASchema.pick({ code: true }).parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_INACTIVE);
    }

    const isValid =
      user.twoFactorMethod === TwoFactorMethod.APP
        ? !!user.twoFactorSecret && authenticator.verify({ token: code, secret: user.twoFactorSecret })
        : user.emailOtpCode === code &&
          !!user.emailOtpExpiresAt &&
          new Date(user.emailOtpExpiresAt).getTime() > Date.now();

    if (!isValid) {
      throw new Error(AUTH_MESSAGES.TWO_FACTOR_INVALID_CODE);
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