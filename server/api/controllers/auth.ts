import type { Express } from "express";
import rateLimit from "express-rate-limit";
import { AUTH_MESSAGES, HTTP_STATUS } from "server/shared/constants";
import { authMiddleware } from "server/shared/middleware/authMiddleware";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { authService } from "server/service/auth_service";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const publicGetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerAuthRoutes(app: Express): Promise<void> {
  app.get(
    "/api/auth/system-status",
    publicGetLimiter,
    asyncHandler(async (_req, res) => {
      const response = await authService.getSystemStatus();
      ResponseHandler.success(res, AUTH_MESSAGES.SYSTEM_STATUS_SUCCESS, response, HTTP_STATUS.OK);
    })
  );

  app.get(
    "/api/auth/subscription-plans",
    publicGetLimiter,
    asyncHandler(async (_req, res) => {
      const response = await authService.getPublicSubscriptionPlans();
      ResponseHandler.success(res, AUTH_MESSAGES.PUBLIC_PLANS_SUCCESS, response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/register",
    authLimiter,
    asyncHandler(async (req, res) => {
      const response = await authService.register(req);
      ResponseHandler.success(res, AUTH_MESSAGES.REGISTER_SUCCESS, response, HTTP_STATUS.CREATED);
    })
  );

  app.post(
    "/api/auth/login",
    authLimiter,
    asyncHandler(async (req, res) => {
      const response = await authService.login(req);
      ResponseHandler.success(res, AUTH_MESSAGES.LOGIN_SUCCESS, response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/verify-2fa",
    authLimiter,
    asyncHandler(async (req, res) => {
      const response = await authService.verifyTwoFactor(req);
      ResponseHandler.success(res, AUTH_MESSAGES.LOGIN_SUCCESS, response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/refresh",
    authLimiter,
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body as { refreshToken?: string };
      const response = await authService.refresh(refreshToken || "", req);
      ResponseHandler.success(res, AUTH_MESSAGES.REFRESH_SUCCESS, response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/logout",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.logout(req);
      ResponseHandler.success(res, AUTH_MESSAGES.LOGOUT_SUCCESS, null, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/logout-all-sessions",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.logoutAll(req);
      ResponseHandler.success(res, AUTH_MESSAGES.LOGOUT_ALL_SUCCESS, null, HTTP_STATUS.OK);
    })
  );

  app.get(
    "/api/auth/me",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await authService.getCurrentUser(req);
      ResponseHandler.success(res, AUTH_MESSAGES.CURRENT_USER_SUCCESS, user, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/setup",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const response = await authService.setupTwoFactor(req);
      ResponseHandler.success(res, AUTH_MESSAGES.TWO_FACTOR_SETUP_INITIALIZED, response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/verify-setup",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.verifyTwoFactorSetup(req);
      ResponseHandler.success(res, AUTH_MESSAGES.TWO_FACTOR_SETUP_SUCCESS, null, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/disable",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.disableTwoFactor(req);
      ResponseHandler.success(res, AUTH_MESSAGES.TWO_FACTOR_DISABLED, null, HTTP_STATUS.OK);
    })
  );
}